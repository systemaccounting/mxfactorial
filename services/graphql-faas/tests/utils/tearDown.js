const AWS = require('aws-sdk')

const tearDownIntegrationTestDataInRDS = () => {
  // https://github.com/aws/aws-sdk-js/issues/2376
  // RDSDataService not available in lambda-bundled aws-sdk 2.290.0 so
  // lambda using mysql2 (1mb) avoids uploading newer aws-sdk (38mb).
  // wait until lambda available Libraries updates to remove mysql2 package
  const lambda = new AWS.Lambda({
    apiVersion: '2015-03-31',
    region: process.env.AWS_REGION
  })
  const params = {
    FunctionName: `delete-faker-rds-transactions-lambda-${
      process.env.LOCAL_ENV
    }`,
    InvokeArgs: `null`
  }
  lambda.invokeAsync(params, (err, data) => {
    if (err) {
      console.log(err, err.stack)
    } else if (data.Status === 202) {
      // console.log(`rds test data deleted by lambda`)
    }
  })
}

module.exports = {
  tearDownIntegrationTestDataInRDS
}
