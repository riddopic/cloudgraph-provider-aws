import { Service } from '@cloudgraph/sdk'
import BaseService from '../base'
import getConnections from './connections'

export default class AwsTag extends BaseService implements Service {
  format = ({ service }: { service: any }): any => service

  getConnections = getConnections.bind(this)

  getData
}
