import { Service } from '@cloudgraph/sdk'
import BaseService from '../base'
import format from './format'
import getData from './data'
import getConnections from './connections'

export default class ElastiCacheReplicationGroup
  extends BaseService
  implements Service
{
  format = format.bind(this)

  getData = getData.bind(this)

  getConnections = getConnections.bind(this)
}
