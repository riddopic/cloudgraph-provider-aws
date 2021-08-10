import * as Sentry from '@sentry/node'
import isEmpty from 'lodash/isEmpty'
import groupBy from 'lodash/groupBy'
import Lambda, {
  FunctionConfiguration,
  FunctionList,
  ListFunctionsRequest,
  ListFunctionsResponse,
  ListTagsResponse,
  GetFunctionConcurrencyRequest,
  GetFunctionConcurrencyResponse,
  ReservedConcurrentExecutions,
} from 'aws-sdk/clients/lambda'
import { AWSError } from 'aws-sdk/lib/error'
import CloudGraph from '@cloudgraph/sdk'
import awsLoggerText from '../../properties/logger'

import { Credentials } from '../../types'
import { Tag } from '../../types/generated'
import { initTestEndpoint } from '../../utils'

const lt = { ...awsLoggerText }
const MAX_ITEMS = 50
const { logger } = CloudGraph
const endpoint = initTestEndpoint('Lambda')

export interface AwsLambdaFunction extends FunctionConfiguration {
  tags?: Tag[]
  region: string
  reservedConcurrentExecutions: ReservedConcurrentExecutions
}

const listFunctionsForRegion = async ({
  lambda,
  resolveRegion,
}: {
  lambda: Lambda
  resolveRegion: () => void
}): Promise<FunctionList> =>
  new Promise<FunctionList>(resolve => {
    const functionsList: FunctionList = []
    const listFunctionsOpts: ListFunctionsRequest = {}
    const listAllFunctions = (token?: string): void => {
      listFunctionsOpts.MaxItems = MAX_ITEMS
      if (token) {
        listFunctionsOpts.Marker = token
      }
      try {
        lambda.listFunctions(
          listFunctionsOpts,
          (err: AWSError, data: ListFunctionsResponse) => {
            const { NextMarker, Functions = [] } = data || {}
            if (err) {
              logger.error(err)
              Sentry.captureException(new Error(err.message))
            }
            /**
             * No Lambdas for this region
             */
            if (isEmpty(data)) {
              return resolveRegion()
            }

            functionsList.push(...Functions)

            if (NextMarker) {
              logger.debug(lt.foundMoreLambdas(Functions.length))
              listAllFunctions(NextMarker)
            }

            resolve(functionsList)
          }
        )
      } catch (error) {
        resolve([])
      }
    }
    listAllFunctions()
  })

const getFunctionConcurrency = async (
  lambda: Lambda,
  FunctionName: string
): Promise<ReservedConcurrentExecutions> =>
  new Promise(resolve => {
    const getFunctionConcurrencyOpts: GetFunctionConcurrencyRequest = {
      FunctionName,
    }
    try {
      lambda.getFunctionConcurrency(
        getFunctionConcurrencyOpts,
        (err: AWSError, data: GetFunctionConcurrencyResponse) => {
          const { ReservedConcurrentExecutions: reservedConcurrentExecutions } =
            data || {}
          if (err) {
            logger.error(err)
            Sentry.captureException(new Error(err.message))
          }
          resolve(reservedConcurrentExecutions || -1)
        }
      )
    } catch (error) {
      resolve(null)
    }
  })

const getResourceTags = async (lambda: Lambda, arn: string): Promise<Tag[]> =>
  new Promise(resolve => {
    try {
      lambda.listTags(
        { Resource: arn },
        (err: AWSError, data: ListTagsResponse) => {
          if (err) {
            logger.error(err)
            Sentry.captureException(new Error(err.message))
            resolve([])
          }
          const { Tags: tags = {} } = data || {}
          resolve(Object.entries(tags).map(([key, value]) => ({ key, value })))
        }
      )
    } catch (error) {
      resolve([])
    }
  })

export default async ({
  regions,
  credentials,
}: {
  regions: string
  credentials: Credentials
}): Promise<{ [property: string]: AwsLambdaFunction[] }> =>
  new Promise(async resolve => {
    const lambdaData: AwsLambdaFunction[] = []
    const regionPromises = []
    const tagsPromises = []

    // get all Lambdas for all regions
    regions.split(',').map(region => {
      const lambda = new Lambda({ region, credentials, endpoint })
      const regionPromise = new Promise<void>(async resolveRegion => {
        const functionsList = await listFunctionsForRegion({
          lambda,
          resolveRegion,
        })
        if (!isEmpty(functionsList)) {
          const promises = functionsList.map(async fn => ({
            ...fn,
            reservedConcurrentExecutions: await getFunctionConcurrency(
              lambda,
              fn.FunctionName
            ),
            region,
          }))
          lambdaData.push(...(await Promise.all(promises)))
        }
        resolveRegion()
      })
      regionPromises.push(regionPromise)
    })

    await Promise.all(regionPromises)
    logger.debug(lt.fetchedLambdas(lambdaData.length))

    // get all tags for each Lambda
    lambdaData.map(({ FunctionArn: arn, region }, idx) => {
      const lambda = new Lambda({ region, credentials })
      const tagsPromise = new Promise<void>(async resolveTags => {
        const envTags: Tag[] = await getResourceTags(lambda, arn)
        lambdaData[idx].tags = envTags
        resolveTags()
      })
      tagsPromises.push(tagsPromise)
    })

    logger.debug(lt.gettingLambdaTags)
    await Promise.all(tagsPromises)

    resolve(groupBy(lambdaData, 'region'))
  })