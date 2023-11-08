async function publishSNSMessage() {
  const { SNSClient, PublishCommand, SNS } = require("@aws-sdk/client-sns");
  const { S3Client, GetBucketNotificationConfigurationCommand } = require("@aws-sdk/client-s3");

  const snsClient = new SNSClient({ region: "us-east-1" });
  const s3Client = new S3Client({ region: "us-east-1" });

  const bucketName = "my-bucket";
  const topicArn = "arn:aws:sns:us-east-1:123456789012:my-topic";

  // Get the S3 bucket notification configuration
  try {
    const getBucketNotificationConfigurationCommand = new GetBucketNotificationConfigurationCommand({ Bucket: bucketName });
    const getBucketNotificationConfigurationResult = await s3Client.send(getBucketNotificationConfigurationCommand);

    // Check if the SNS topic is already configured
    const notificationConfigurations = getBucketNotificationConfigurationResult.NotificationConfigurations;
    const snsTopicConfiguration = notificationConfigurations.find((config) => config.TopicArn === topicArn);

    if (!snsTopicConfiguration) {
      console.error("SNS topic is not configured for bucket notifications");
      return;
    }
  } catch (error) {
    console.error("Failed to get bucket notification configuration", error);
    return;
  }

  // Publish an SNS message
  const event = {
    Records: [
      {
        s3: {
          bucket: {
            name: bucketName,
          },
          object: {
            key: "my-object.txt",
          },
        },
      },
    ],
  };

  try {
    const publishCommand = new PublishCommand({
      TopicArn: topicArn,
      Message: JSON.stringify(event),
    });

    const publishResult = await snsClient.send(publishCommand);
    console.log("SNS message published successfully", publishResult);
  } catch (error) {
    console.error("Failed to publish SNS message", error);
  }
}

publishSNSMessage();

