import CloudGraph from '@cloudgraph/sdk'
import RDS, {
  DBCluster,
  TagListMessage,
  DescribeDBClustersMessage,
  DBClusterMessage,
} from 'aws-sdk/clients/rds'
import { AWSError } from 'aws-sdk/lib/error'
import groupBy from 'lodash/groupBy'
import isEmpty from 'lodash/isEmpty'
import { Config } from 'aws-sdk/lib/config'
import awsLoggerText from '../../properties/logger'
import { TagMap, AwsTag } from '../../types'
import { convertAwsTagsToTagMap } from '../../utils/format'
import AwsErrorLog from '../../utils/errorLog'
import { initTestEndpoint } from '../../utils'

const lt = { ...awsLoggerText }
const { logger } = CloudGraph
const serviceName = 'RDS DB cluster'
const errorLog = new AwsErrorLog(serviceName)
const endpoint = initTestEndpoint(serviceName)

const listClustersForRegion = async rds =>
  new Promise<DBCluster[]>(resolve => {
    const clusterList: DBCluster[] = []
    const descClustersOpts: DescribeDBClustersMessage = {}
    const listAllClusters = (token?: string) => {
      if (token) {
        descClustersOpts.Marker = token
      }
      try {
        rds.describeDBClusters(
          descClustersOpts,
          (err: AWSError, data: DBClusterMessage) => {
            const { Marker, DBClusters = [] } = data || {}
            if (err) {
              errorLog.generateAwsErrorLog({
                functionName: 'rds:describeDBClusters',
                err,
              })
            }

            clusterList.push(...DBClusters)

            if (Marker) {
              listAllClusters(Marker)
            }

            resolve(clusterList)
          }
        )
      } catch (error) {
        resolve([])
      }
    }
    listAllClusters()
  })

const getResourceTags = async (rds: RDS, arn: string): Promise<TagMap> =>
  new Promise(resolve => {
    try {
      rds.listTagsForResource(
        { ResourceName: arn },
        (err: AWSError, data: TagListMessage) => {
          if (err) {
            errorLog.generateAwsErrorLog({
              functionName: 'rds:listTagsForResource',
              err,
            })
            return resolve({})
          }
          const { TagList: tags = [] } = data || {}
          resolve(convertAwsTagsToTagMap(tags as AwsTag[]))
        }
      )
    } catch (error) {
      resolve({})
    }
  })

export interface RawAwsRdsCluster extends DBCluster {
  Tags?: TagMap
  region: string
}

export default async ({
  regions,
  config,
}: {
  regions: string
  config: Config
}): Promise<{ [property: string]: RawAwsRdsCluster[] }> =>
  new Promise(async resolve => {
    const rdsData: RawAwsRdsCluster[] = []
    const regionPromises = []
    const tagsPromises = []

    // Get all the clusters for the region
    regions.split(',').map(region => {
      const regionPromise = new Promise<void>(async resolveRegion => {
        const rds = new RDS({ ...config, region, endpoint })
        const clusters = await listClustersForRegion(rds)

        if (!isEmpty(clusters)) {
          rdsData.push(
            ...clusters.map(cluster => ({
              ...cluster,
              region,
            }))
          )
        }
        resolveRegion()
      })
      regionPromises.push(regionPromise)
    })

    await Promise.all(regionPromises)
    logger.debug(lt.fetchedRdsClusters(rdsData.length))

    // get all tags for each cluster
    rdsData.map(({ DBClusterArn, region }, idx) => {
      const rds = new RDS({ ...config, region, endpoint })
      const tagsPromise = new Promise<void>(async resolveTags => {
        rdsData[idx].Tags = await getResourceTags(rds, DBClusterArn)
        resolveTags()
      })
      tagsPromises.push(tagsPromise)
    })

    await Promise.all(tagsPromises)
    errorLog.reset()

    resolve(groupBy(rdsData, 'region'))
  })
