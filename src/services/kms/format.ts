import t from '../../properties/translations'
import { AwsKms } from './data'
import { AwsKms as AwsKmsType } from '../../types/generated'
import { formatTagsFromMap, formatIamJsonPolicy } from '../../utils/format'

/**
 * KMS
 */

export default ({
  service: key,
  account,
  region
}: {
  service: AwsKms
  account: string
  region: string
}): AwsKmsType => {
  const {
    Arn: arn,
    Tags,
    Description: description,
    KeyId: id,
    policy,
    keyRotationEnabled,
    KeyUsage: usage,
    Enabled: enabled,
    KeyState: keyState,
    CustomerMasterKeySpec: customerMasterKeySpec,
    CreationDate: creationDate,
    KeyManager: keyManager,
    Origin: origin,
    DeletionDate: deletionDate,
    ValidTo: validTo,
  } = key

  return {
    accountId: account,
    arn,
    region,
    id,
    description,
    keyRotationEnabled,
    usage,
    policy: formatIamJsonPolicy(policy),
    enabled,
    keyState,
    customerMasterKeySpec,
    tags: formatTagsFromMap(Tags),
    creationDate: creationDate ? creationDate.toString() : undefined,
    keyManager,
    origin,
    deletionDate: deletionDate ? deletionDate.toString() : undefined,
    validTo: validTo ? validTo.toString() : undefined,
  }
}
