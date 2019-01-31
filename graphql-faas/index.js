const awsServerlessExpress = require('aws-serverless-express')
const { appWrapper } = require('./src/app')

exports.handler = (event, context, callback) => {
  const server = awsServerlessExpress.createServer(appWrapper(event, context))
  return awsServerlessExpress.proxy(server, event, context)
}
