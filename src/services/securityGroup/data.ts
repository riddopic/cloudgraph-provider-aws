import * as Sentry from '@sentry/node'

import groupBy from 'lodash/groupBy'
import isEmpty from 'lodash/isEmpty'

import { Request } from 'aws-sdk'
import EC2, {
  SecurityGroup,
  DescribeSecurityGroupsResult,
  DescribeSecurityGroupsRequest,
} from 'aws-sdk/clients/ec2'
import { AWSError } from 'aws-sdk/lib/error'

import CloudGraph from '@cloudgraph/sdk'
import { Credentials } from '../../types'

import awsLoggerText from '../../properties/logger'
import { Tag } from '../../types/generated'
import { initTestEndpoint } from '../../utils'

const lt = { ...awsLoggerText }
const { logger } = CloudGraph
const endpoint = initTestEndpoint('Security Groups')

/**
 * Security Groups
 */

export interface AwsSecurityGroup extends Omit<SecurityGroup, 'Tags'> {
  Tags: Tag[]
  region: string
}

export default async ({
  regions,
  credentials,
}: {
  regions: string
  credentials: Credentials
}): Promise<{ [property: string]: AwsSecurityGroup[] }> =>
  new Promise(async resolve => {
    const sgData: AwsSecurityGroup[] = []
    const regionPromises = []

    const listSgData = async ({
      ec2,
      region,
      token: NextToken = '',
      resolveRegion,
    }: {
      ec2: EC2
      region: string
      token?: string
      resolveRegion: () => void
    }): Promise<Request<EC2.Types.DescribeSecurityGroupsResult, AWSError>> => {
      let args: DescribeSecurityGroupsRequest = {}

      if (NextToken) {
        args = { ...args, NextToken }
      }

      return ec2.describeSecurityGroups(
        args,
        (err: AWSError, data: DescribeSecurityGroupsResult) => {
          if (err) {
            logger.error(err)
            Sentry.captureException(new Error(err.message))
          }

          /**
           * No SG data for this region
           */
          if (isEmpty(data)) {
            return resolveRegion()
          }

          const { SecurityGroups: sgs, NextToken: token } = data

          logger.debug(lt.fetchedSecurityGroups(sgs.length))

          /**
           * No SGs Found
           */

          if (isEmpty(sgs)) {
            return resolveRegion()
          }

          /**
           * Check to see if there are more
           */

          if (token) {
            listSgData({ region, token, ec2, resolveRegion })
          }

          /**
           * Add the found SGs to the sgData
           */

          sgData.push(
            ...sgs.map(({ Tags, ...sg }) => ({
              ...sg,
              region,
              Tags: Tags.map(({ Key, Value }) => ({
                key: Key,
                value: Value,
              })),
            }))
          )

          /**
           * If this is the last page of data then return
           */

          if (!token) {
            resolveRegion()
          }
        }
      )
    }

    regions.split(',').map(region => {
      const ec2 = new EC2({ region, credentials, endpoint })

      const regionPromise = new Promise<void>(resolveRegion =>
        listSgData({ ec2, region, resolveRegion })
      )
      regionPromises.push(regionPromise)
    })

    await Promise.all(regionPromises)
    resolve(groupBy(sgData, 'region'))
  })