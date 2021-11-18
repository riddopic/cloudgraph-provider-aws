import { Service } from '@cloudgraph/sdk'
import BaseService from '../base'
import format from './format'
import getConnections from './connections'
import getData from './data'

export default class NetworkInterface extends BaseService implements Service {
  format = format.bind(this)

  getConnections = getConnections.bind(this)

  getData = getData.bind(this)
}
