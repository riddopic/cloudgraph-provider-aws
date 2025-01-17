import CloudGraph from '@cloudgraph/sdk'
import groupBy from 'lodash/groupBy'
import isEmpty from 'lodash/isEmpty'

import EC2, {
  DescribeTransitGatewayAttachmentsRequest,
  DescribeTransitGatewayAttachmentsResult,
  TransitGatewayAttachmentList,
  TransitGatewayAttachment,
} from 'aws-sdk/clients/ec2'

import { Config } from 'aws-sdk/lib/config'
import { AWSError } from 'aws-sdk/lib/error'
import { AwsTag, TagMap } from '../../types'
import awsLoggerText from '../../properties/logger'
import { initTestEndpoint } from '../../utils'
import { convertAwsTagsToTagMap } from '../../utils/format'
import AwsErrorLog from '../../utils/errorLog'

const lt = { ...awsLoggerText }
const { logger } = CloudGraph
const serviceName = 'TransitGatewayAttachment'
const errorLog = new AwsErrorLog(serviceName)
const endpoint = initTestEndpoint(serviceName)

const listTransitGatewayAttachmentsData = async ({
  ec2,
  region,
  nextToken: NextToken = '',
}: {
  ec2: EC2
  region: string
  nextToken?: string
}): Promise<(TransitGatewayAttachment & { region: string })[]> =>
  new Promise<(TransitGatewayAttachment & { region: string })[]>(resolve => {
    let transitGatewayAttachmentData: (TransitGatewayAttachment & {
      region: string
    })[] = []
    const transitGatewayAttachmentList: TransitGatewayAttachmentList = []
    let args: DescribeTransitGatewayAttachmentsRequest = {}

    if (NextToken) {
      args = { ...args, NextToken }
    }

    ec2.describeTransitGatewayAttachments(
      args,
      (err: AWSError, data: DescribeTransitGatewayAttachmentsResult) => {
        if (err) {
          errorLog.generateAwsErrorLog({
            functionName: 'ec2:describeTransitGatewayAttachments',
            err,
          })
        }

        if (!isEmpty(data)) {
          const {
            NextToken: nextToken,
            TransitGatewayAttachments: transitGatewayAttachments = [],
          } = data

          transitGatewayAttachmentList.push(...transitGatewayAttachments)

          logger.debug(
            lt.fetchedTransitGatewayAttachments(
              transitGatewayAttachments.length
            )
          )

          if (nextToken) {
            listTransitGatewayAttachmentsData({ ec2, region, nextToken })
          }

          transitGatewayAttachmentData = transitGatewayAttachmentList.map(
            attachment => ({
              ...attachment,
              region,
            })
          )
        }

        resolve(transitGatewayAttachmentData)
      }
    )
  })

/**
 * Transit Gateway Attachment
 */

export interface RawAwsTransitGatewayAttachment
  extends Omit<TransitGatewayAttachment, 'Tags'> {
  region: string
  Tags?: TagMap
}

export default async ({
  regions,
  config,
}: {
  regions: string
  config: Config
}): Promise<{
  [region: string]: RawAwsTransitGatewayAttachment[]
}> =>
  new Promise(async resolve => {
    const transitGatewayAttachmentsResult: RawAwsTransitGatewayAttachment[] = []

    const regionPromises = regions.split(',').map(region => {
      const ec2 = new EC2({ ...config, region, endpoint })

      return new Promise<void>(async resolveTransitGatewayAttachmentData => {
        // Get Transit Gateway Attachment Data
        const transitGatewayAttachments =
          await listTransitGatewayAttachmentsData({
            ec2,
            region,
          })

        if (!isEmpty(transitGatewayAttachments)) {
          for (const attachment of transitGatewayAttachments) {
            transitGatewayAttachmentsResult.push({
              ...attachment,
              region,
              Tags: convertAwsTagsToTagMap(attachment.Tags as AwsTag[]),
            })
          }
        }

        resolveTransitGatewayAttachmentData()
      })
    })

    await Promise.all(regionPromises)
    errorLog.reset()

    resolve(groupBy(transitGatewayAttachmentsResult, 'region'))
  })
