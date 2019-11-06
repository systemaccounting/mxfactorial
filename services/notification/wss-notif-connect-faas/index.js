const AWS = require('aws-sdk')

const {
  putItem,
  queryTable,
  deleteConnection
} = require('./lib/awsServices')

const WEBSOCKETS_TABLE_NAME = process.env.WEBSOCKETS_TABLE_NAME
const AWS_REGION = process.env.AWS_REGION
const WEBSOCKET_TABLE_PRIMARY_KEY = 'connection_id'
const WEBSOCKET_TABLE_SORT_KEY = 'timestamp'


exports.handler = async event => {
  console.log(JSON.stringify(event))

  let ddb = new AWS.DynamoDB.DocumentClient({ region: AWS_REGION})
  let connectionId = event.requestContext.connectionId

  // store connection id in ddb
  if (event.requestContext.eventType === "CONNECT") {

    let time = Date.now()
    await putItem(ddb, WEBSOCKETS_TABLE_NAME, time, connectionId)

  // or delete connection id item if disconnecting web websocket
  } else if (event.requestContext.eventType === "DISCONNECT") {

    let connectionValues = await queryTable(
      ddb,
      WEBSOCKETS_TABLE_NAME,
      WEBSOCKET_TABLE_PRIMARY_KEY,
      connectionId
    )

    let singleConnection = connectionValues[0]

    await deleteConnection(
      ddb,
      WEBSOCKETS_TABLE_NAME,
      WEBSOCKET_TABLE_PRIMARY_KEY,
      WEBSOCKET_TABLE_SORT_KEY,
      singleConnection
    )

  } else {
    throw new Error('unmatched eventType')
  }
  return {
    statusCode: 200
  }
}