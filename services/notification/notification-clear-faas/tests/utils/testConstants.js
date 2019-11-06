const fs = require('fs')

module.exports = {
  TEST_TOKEN: fs.readFileSync(__dirname + '/test-pem/token', 'ascii'),
  FAKE_TOKEN: 'eyJraWQiOiJBcGhVMFJFU2N2M0Z1NnhCdk9Ca2JOcjZpU3VZXC94ZmFQNmZ5am95aFNRTT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJlMTdjZWYyZi02NWU3LTQ1YmMtOTcwNS1hZGU1MjdiOWVmMjYiLCJhdWQiOiIzdTB0aTA2OThhcDMyNHFnNnQ3MzU4dWJpbSIsImV2ZW50X2lkIjoiMWQ0ZGZjNWMtNDkyZi00YjQ0LTkyYzAtMjFjOGFlZmE4Y2Q3IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE1Njg5NTg3NTgsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX3lNUFAzVFVKOCIsImNvZ25pdG86dXNlcm5hbWUiOiJKb2VTbWl0aCIsImV4cCI6MTU2ODk2MjM1OCwiaWF0IjoxNTY4OTU4NzU4fQ.bDzwyzaOhrnCPByAIrOpUAQXZCIOgds3HegMHPSyms_JvruUMQzph8GouqT1RnUQdiCdtPFurp0zA_1s6sxPLnCsAgkeaoEJBgNIMRae2JUh-VCBYkbGWUZmqn6xIS5g3E5jiyo7i1dsEpHd3AEq2mnd3jn5cEorFzjZwTfxc4yQCabWCHtU5uhmbuiPZ6q8fiqArOuNbE-xHiIpmDqJ8hDYZC2UE3SVX-RHteGPhP5cQerj9jssk1MBh4ecZz7puP0BF_yOUWherPLHNLPGlLTKP0tjZ-S5EcD42XgqyYQp412vhm6O45TNBNfjXKavXZ-kBL-JmYeAH8MbX4TuBg',
  TEST_PUBLIC_PEM: fs.readFileSync(__dirname + '/test-pem/pub.pem', 'ascii'),
  TEST_TOKEN_PAYLOAD: {
    "sub": "01234567-0123-0123-0123-012345678910",
    "aud": "01234567890123456789012345",
    "event_id": "01234567-0123-0123-0123-012345678910",
    "token_use": "id",
    "auth_time": 1234567890,
    "iss": "https:\/\/cognito-idp.us-east-1.amazonaws.com\/us-east-1_012345678",
    "cognito:username": "testaccount",
    "exp": 1234567890,
    "iat": 1234567890
  },
  TEST_POOL_LIST: [
    {
      "Id": "us-east-1_test",
      "Name": process.env.POOL_NAME,
      "LambdaConfig": {
        "PreSignUp": "arn"
      },
      "LastModifiedDate": "2019-08-04T05:31:19.578Z",
      "CreationDate": "2019-08-04T05:31:19.578Z"
    },
    {
      "Id": "us-east-1_id",
      "Name": 'mxfactorial-other',
      "LambdaConfig": {
        "PreSignUp": "arn"
      },
      "LastModifiedDate": "2019-08-04T05:35:54.438Z",
      "CreationDate": "2019-08-04T05:35:54.438Z"
    }
  ],
  TEST_UNMATCHABLE_POOL_LIST: [
    {
      "Id": "us-east-1_id",
      "Name": "a-pool",
      "LambdaConfig": {
        "PreSignUp": "arn"
      },
      "LastModifiedDate": "2019-08-04T05:31:19.578Z",
      "CreationDate": "2019-08-04T05:31:19.578Z"
    }
  ],
  TEST_DUPLICATE_POOL_LIST: [
    {
      "Id": "us-east-1_id",
      "Name": process.env.POOL_NAME,
      "LambdaConfig": {
        "PreSignUp": "arn"
      },
      "LastModifiedDate": "2019-08-04T05:31:19.578Z",
      "CreationDate": "2019-08-04T05:31:19.578Z"
    },
    {
      "Id": "us-east-1_id",
      "Name": process.env.POOL_NAME,
      "LambdaConfig": {
        "PreSignUp": "arn"
      },
      "LastModifiedDate": "2019-08-04T05:35:54.438Z",
      "CreationDate": "2019-08-04T05:35:54.438Z"
    }
  ],
  TEST_KEYS: [
    fs.readFileSync(__dirname + '/test-pem/jwk.json', 'ascii'),
    fs.readFileSync(__dirname + '/test-pem/jwk2.json', 'ascii')
  ]
}