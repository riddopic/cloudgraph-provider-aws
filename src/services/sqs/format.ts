import { AwsSqs } from './data'
import { AwsSqs as AwsSqsType } from '../../types/generated'
import t from '../../properties/translations'
import getTime from '../../utils/dateutils'

/**
 * SQS
 */

export default ({ 
  service: key,
}:{
  service: AwsSqs
  // allTagData: Tags[]
}): AwsSqsType => {
  const {
    queueUrl,
    tags,
  } = key

  const {
    QueueArn: arn,
    ApproximateNumberOfMessages: approximateNumberOfMessages,
    ApproximateNumberOfMessagesNotVisible: approximateNumberOfMessagesNotVisible,
    ApproximateNumberOfMessagesDelayed: approximateNumberOfMessagesDelayed,
    VisibilityTimeout: visibilityTimeout,
    MaximumMessageSize: maximumMessageSize,
    MessageRetentionPeriod: messageRetentionPeriod,
    DelaySeconds: delaySeconds,
    Policy: policy,
    ReceiveMessageWaitTimeSeconds: receiveMessageWaitTimeSeconds,
  } = key.sqsAttributes

  return {
    arn,
    queueUrl,
    queueType: arn.includes('.fifo') ? t.fifo : t.standard,
    approximateNumberOfMessages: parseInt(approximateNumberOfMessages, 10),
    approximateNumberOfMessagesNotVisible: parseInt(approximateNumberOfMessagesNotVisible, 10),
    approximateNumberOfMessagesDelayed: parseInt(approximateNumberOfMessagesDelayed, 10),
    visibilityTimeout: getTime(visibilityTimeout),
    maximumMessageSize: Math.round(
      parseInt(maximumMessageSize, 10) * 0.001 // This is a conversion from bytes to Kbytes
    ),
    messageRetentionPeriod: getTime(messageRetentionPeriod),
    delaySeconds: `${delaySeconds} ${t.seconds}`,
    policy,
    receiveMessageWaitTimeSeconds: getTime(receiveMessageWaitTimeSeconds),
    tags,
  }
}
