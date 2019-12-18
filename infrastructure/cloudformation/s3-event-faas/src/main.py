# code from https://aws.amazon.com/premiumsupport/knowledge-center/cloudformation-s3-notification-lambda/
# purges previously-added notifications, complicates unit test mocking, and includes unused imports
# rewritten:
from __future__ import print_function
import json
import boto3
import os
import requests

# https://docs.aws.amazon.com/lambda/latest/dg/lambda-environment-variables.html
AWS_REGION = os.environ['AWS_REGION']
ENVIRONMENT = os.environ['ENVIRONMENT']
ARTIFACTS_BUCKET = os.environ['ARTIFACTS_BUCKET']

# https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/s3.html#S3.BucketNotification.put
lambda_list_name = 'LambdaFunctionConfigurations'
queue_list_name = 'QueueConfigurations'
topic_list_name = 'TopicConfigurations'

print('Loading function')
s3 = boto3.client('s3')


def lambda_handler(event, context):
    print("Received event:")
    print(event)
    responseData = {}
    # https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/crpg-ref-requests.html#crpg-ref-request-resourceproperties
    object_name = event['ResourceProperties']['ObjectName']
    resource_name = event['ResourceProperties']['ResourceName']
    initial_config = get_notifications(ARTIFACTS_BUCKET)
    try:
        if event['RequestType'] == 'Delete':
            print("Request Type:", event['RequestType'])
            new_config = delete_lambda_notification(initial_config, object_name, resource_name)
            print("Sending response to custom resource after Delete")
        elif event['RequestType'] == 'Create' or event['RequestType'] == 'Update':
            print("Request Type:", event['RequestType'])
            account_id = event['ResourceProperties']['AccountId']
            new_config = add_lambda_notification(initial_config, object_name, resource_name, account_id)
            responseData = {'ObjectName': object_name}
            print("Sending response to custom resource")
        print(new_config)
        s3.put_bucket_notification_configuration(
          Bucket=ARTIFACTS_BUCKET,
          NotificationConfiguration=new_config
        )
        responseStatus = 'SUCCESS'
    except Exception as e:
        print('Failed to process:', e)
        responseStatus = 'FAILED'
        responseData = {'Failure': 'Unexpected event.'}
    send(event, context, responseStatus, responseData)


def get_notifications(bucket):
  bucket_notifications = s3.get_bucket_notification_configuration(
    Bucket=ARTIFACTS_BUCKET
  )
  # print(bucket_notifications)
  notification_configuration = {}
  if lambda_list_name in bucket_notifications.keys():
    notification_configuration[lambda_list_name] = bucket_notifications[lambda_list_name]
  if queue_list_name in bucket_notifications.keys():
    notification_configuration[queue_list_name] = bucket_notifications[queue_list_name]
  if topic_list_name in bucket_notifications.keys():
    notification_configuration[topic_list_name] = bucket_notifications[topic_list_name]
  print(notification_configuration)
  return notification_configuration


def add_lambda_notification(initial_config, object_name, resource_name, account_id):
  notification = {
    'Id': resource_name,
    'LambdaFunctionArn': f"arn:aws:lambda:{AWS_REGION}:{account_id}:function:deploy-lambda-{ENVIRONMENT}",
    'Events': [
      "s3:ObjectCreated:*"
    ],
    'Filter': {
      'Key': {
        'FilterRules': [
          {
            'Name': "Prefix",
            'Value': object_name
          }
        ]
      }
    }
  }
  print(notification)
  new_config = {}
  if lambda_list_name not in initial_config.keys():
    new_config[lambda_list_name] = [notification]
    return new_config
  else:
    def filter_cloudformation_managed_lambda(x):
      return (x['Id'] != resource_name or x['Filter']['Key']['FilterRules'][0]['Value'] != object_name)
    # avoid: error PutBucketNotificationConfiguration operation: Same ID used for multiple configurations
    deduped_config_list = list(filter(filter_cloudformation_managed_lambda, initial_config[lambda_list_name]))
    if len(deduped_config_list) < len(initial_config[lambda_list_name]): print('deduping notification configuration')
    new_config[lambda_list_name] = deduped_config_list
    new_config[lambda_list_name].append(notification)
    return new_config


def delete_lambda_notification(initial_config, object_name, resource_name):
  # reconstruct object intended for put
  new_config = {}
  def filter_cloudformation_managed_lambda(x):
    return (x['Id'] != resource_name or x['Filter']['Key']['FilterRules'][0]['Value'] != object_name)
  filtered_config_list = list(filter(filter_cloudformation_managed_lambda, initial_config[lambda_list_name]))
  new_config[lambda_list_name] = filtered_config_list
  if queue_list_name in initial_config:
    new_config[queue_list_name] = initial_config[queue_list_name]
  if topic_list_name in initial_config:
    new_config[topic_list_name] = initial_config[topic_list_name]
  # print(new_config)
  # return empty object if lists empty
  list_lengths = []
  for key in new_config.keys():
    length_of_list = len(new_config[key])
    list_lengths.append(length_of_list)
  reduced = 0
  for idx in list_lengths:
    reduced =+ idx
  if reduced == 0:
    print('adding empty configuration')
    return {}
  else:
    print(new_config)
    return new_config

def send(event, context, responseStatus, responseData, physicalResourceId=None, noEcho=False):
    responseUrl = event['ResponseURL']
    print(responseUrl)
    responseBody = {'Status': responseStatus,
                    'Reason': 'See the details in CloudWatch Log Stream: ' + context.log_stream_name,
                    'PhysicalResourceId': physicalResourceId or context.log_stream_name,
                    'StackId': event['StackId'],
                    'RequestId': event['RequestId'],
                    'LogicalResourceId': event['LogicalResourceId'],
                    'Data': responseData}
    json_responseBody = json.dumps(responseBody)
    print("Response body:\n" + json_responseBody)
    headers = {
        'content-type': '',
        'content-length': str(len(json_responseBody))
    }
    try:
        response = requests.put(responseUrl,
                                data=json_responseBody,
                                headers=headers)
        print("Status code: " + response.reason)
    except Exception as e:
        print("send(..) failed executing requests.put(..): " + str(e))