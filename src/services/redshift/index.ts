import { Service } from '@cloudgraph/sdk'
import BaseService from '../base'
import getConnections from './connections'
import format from './format'
import getData from './data'

export default class AwsRedshiftCluster extends BaseService implements Service {
  format = format.bind(this)

  getConnections = getConnections.bind(this)

  getData = getData.bind(this)
}
