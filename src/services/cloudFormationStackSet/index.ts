import { Service } from '@cloudgraph/sdk';
import BaseService from '../base';
import format from './format';
import getData from './data';
// import getConnections from './connections'
import mutation from './mutation';

export default class AwsCloudFormation extends BaseService implements Service {
  format = format.bind(this);

  getData = getData.bind(this);

  // TODO: Enable when IAM is added
  // getConnections = getConnections.bind(this)

  mutation = mutation;
}
