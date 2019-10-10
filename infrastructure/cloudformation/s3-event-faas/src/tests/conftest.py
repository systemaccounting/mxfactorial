import pytest

@pytest.fixture
def initial_test_configurations():
  return [
    {
      'Id': "first-resource-dev",
      'LambdaFunctionArn': "arn:aws:lambda:neverland:012345678910:function:deploy-lambda-dev",
      'Events': [
        "s3:ObjectCreated:*"
      ],
      'Filter': {
        'Key': {
          'FilterRules': [
            {
              'Name': "Prefix",
              'Value': "first-src.zip"
            }
          ]
        }
      }
    },
    {
      'Id': "second-resource-dev",
      'LambdaFunctionArn': "arn:aws:lambda:neverland:012345678910:function:deploy-lambda-dev",
      'Events': [
        "s3:ObjectCreated:*"
      ],
      'Filter': {
        'Key': {
          'FilterRules': [
            {
              'Name': "Prefix",
              'Value': "second-src.zip"
            }
          ]
        }
      }
    }
  ]

@pytest.fixture
def additional_test_configuration():
  return {
  "Id": "third-resource-dev",
  "LambdaFunctionArn": "arn:aws:lambda:neverland:012345678910:function:deploy-lambda-dev",
  "Events": [
    "s3:ObjectCreated:*"
  ],
  "Filter": {
    "Key": {
      "FilterRules": [
        {
          "Name": "Prefix",
          "Value": "third-src.zip"
        }
      ]
    }
  }
}