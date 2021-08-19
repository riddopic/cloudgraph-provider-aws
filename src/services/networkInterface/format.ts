import { AwsNetworkInterface } from '../../types/generated'
import { formatTagsFromMap } from '../../utils/format'
import { RawNetworkInterface } from './data'

/**
 * Network Interface
 */

export default ({
  service: rawData,
  account,
  region,
}: {
  service: RawNetworkInterface
  account: string
  region: string
}): AwsNetworkInterface => {
  const {
    NetworkInterfaceId: id,
    MacAddress: macAddress,
    Description: description,
    PrivateDnsName: privateDnsName,
    SubnetId: subnetId,
    AvailabilityZone: availabilityZone,
    Status: status,
    VpcId: vpcId,
    InterfaceType: interfaceType = '',
    Attachment: attachment = {},
    Groups: groups = [],
    PrivateIpAddresses: privateIpAddresses = [],
    Tags: tags = {},
  } = rawData

  const securityGroups = groups.map(({ GroupId }) => GroupId)

  const privateIps = privateIpAddresses.map(
    ({ PrivateIpAddress }) => PrivateIpAddress
  )

  // Format tags
  const networkInterfacesTags = formatTagsFromMap(tags)

  const networkInterface = {
    id,
    arn: `arn:aws:ec2:${region}:${account}:network-interface/${id}`,
    subnetId,
    macAddress,
    privateIps,
    description,
    availabilityZone,
    status,
    vpcId,
    interfaceType,
    securityGroups,
    privateDnsName,
    attachment: {
      attachmentId: attachment?.AttachmentId || '',
      status: attachment?.Status || '',
      deleteOnTermination: attachment?.DeleteOnTermination || false,
    },
    tags: networkInterfacesTags,
  }
  return networkInterface
}