import { Service } from '@cloudgraph/sdk'
import BaseService from '../base'
import format from './format'
import getData from './data'

export default class IamPasswordPolicy extends BaseService implements Service {
  format = format.bind(this)

  getData = getData.bind(this)
}
