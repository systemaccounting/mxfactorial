const AWS = require('aws-sdk')

const {
  putItem,
  deleteConnection
} = require('./lib/awsServices')

// env var inventory (avoid const assignments):
// process.env.WEBSOCKETS_TABLE_NAME
// process.env.AWS_REGION

const WEBSOCKET_TABLE_PRIMARY_KEY = 'connection_id'
const WEBSOCKET_TABLE_CONNECTED_AT_ATTRIBUTE = 'created_at'


exports.handler = async event => {
  console.log(JSON.stringify(event))

  let ddb = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION
  })
  let connectedAt = event.requestContext.connectedAt
  let connectionId = event.requestContext.connectionId

  // store connection id in ddb
  if (event.requestContext.eventType === "CONNECT") {

    await putItem(
      ddb,
      process.env.WEBSOCKETS_TABLE_NAME,
      WEBSOCKET_TABLE_PRIMARY_KEY,
      connectionId,
      WEBSOCKET_TABLE_CONNECTED_AT_ATTRIBUTE,
      connectedAt
    )

  // or delete connection id item if disconnecting web websocket
  } else if (event.requestContext.eventType === "DISCONNECT") {

    await deleteConnection(
      ddb,
      process.env.WEBSOCKETS_TABLE_NAME,
      WEBSOCKET_TABLE_PRIMARY_KEY,
      connectionId
    )

  } else {
    throw new Error('unmatched eventType')
  }
  return {
    statusCode: 200
  }
}