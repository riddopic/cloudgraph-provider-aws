import { AwsIamRole } from '../../types/generated'
import { formatTagsFromMap, formatIamJsonPolicy } from '../../utils/format'

import { RawAwsIamRole } from './data'

/**
 * IAM Role
 */

export default ({
  service: rawData,
  account,
}: {
  service: RawAwsIamRole
  account: string
  region: string
}): AwsIamRole => {
  const {
    RoleName: name = '',
    Arn: arn = '',
    Path: path = '',
    CreateDate: createdAt,
    Description: description = '',
    AssumeRolePolicyDocument: assumeRolePolicy = '',
    MaxSessionDuration: maxSessionDuration = 0,
    Policies: inlinePolicies = [],
    Tags: tags = {},
  } = rawData

  // Format Role Tags
  const roleTags = formatTagsFromMap(tags)

  const role = {
    id: arn,
    arn,
    accountId: account,
    name,
    path,
    createdAt: createdAt?.toISOString() || '',
    description,
    assumeRolePolicy: formatIamJsonPolicy(assumeRolePolicy),
    maxSessionDuration,
    inlinePolicies,
    tags: roleTags,
  }
  return role
}
