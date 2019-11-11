const AWS = require('aws-sdk')
const WebSocket = require('ws')

const {
  createAccount,
  deleteAccount,
  queryTable
} = require('./utils/integrationTestHelpers')

const randomFourDigitInt = () => {
  return Math.floor(Math.random() * (9999 - 1000)) + 1000
}

// process.env.SECRET
// process.env.CLIENT_ID
// process.env.POOL_ID
// process.env.process.env.WSS_CLIENT_URL
// process.env.AWS_REGION
// process.env.WEBSOCKETS_TABLE_NAME

const TEST_ACCOUNT = `FakerAccount${randomFourDigitInt()}`
const WEBSOCKET_TABLE_RANGE_KEY = 'connection_id'

const cognitoIdsp = new AWS.CognitoIdentityServiceProvider()
const ddb = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION })

beforeAll(async () => {
  jest.setTimeout(10000)
  await createAccount(
    cognitoIdsp,
    process.env.CLIENT_ID,
    TEST_ACCOUNT,
    process.env.SECRET
  )
})

afterAll(async() => {
  await deleteAccount(
    cognitoIdsp,
    process.env.POOL_ID,
    TEST_ACCOUNT
  )
})


let timeout = ms => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`waiting ${ms/1000} sec`)
      resolve()
    }, ms)
  })
}

describe('websocket connection lambda', () => {
  test('websocket connects', async done => {
    let ws = new WebSocket(process.env.WSS_CLIENT_URL)
    let opened
    ws.on('open', () => {
      opened = 1
      ws.close()
      expect(opened).toBe(1)
      done()
    })
  })

  test('connection id stored in dynamodb on CONNECT', async done => {
    let ws = new WebSocket(process.env.WSS_CLIENT_URL)
    ws.on('open', async () => {
      await timeout(1e3) // wait for connection id record addition in dynamodb
      ws.send(JSON.stringify({ action: 'getnotifications', token: '' })) // return error with connection id
      ws.on('message', async data => {
        if (JSON.parse(data).connectionId) {
          let connectionIdFromRequest = JSON.parse(data).connectionId
          console.log(connectionIdFromRequest)
          let connectionIdFromDynamoDB = await queryTable(
            ddb,
            process.env.WEBSOCKETS_TABLE_NAME,
            WEBSOCKET_TABLE_RANGE_KEY,
            connectionIdFromRequest
          )
          ws.close()
          expect(connectionIdFromDynamoDB.length).toBeGreaterThan(0)
          done()
        }
      })
    })
  })

  test('connection id removed from dynamodb on DISCONNECT', async done => {
    let ws = new WebSocket(process.env.WSS_CLIENT_URL)
    ws.on('open', async () => {
      ws.send(JSON.stringify({ action: 'getnotifications', token: '' })) // return error with connection id
      ws.on('message', async data => {
        if (JSON.parse(data).connectionId) {
          let connectionIdFromRequest = JSON.parse(data).connectionId
          let connectionIdFromDynamoDB = await queryTable(
            ddb,
            process.env.WEBSOCKETS_TABLE_NAME,
            WEBSOCKET_TABLE_RANGE_KEY,
            connectionIdFromRequest
          )
          if (connectionIdFromDynamoDB.length > 0) {
            ws.close()
            await timeout(1e3) // wait for connection id record removal
            let connectionsAfterClose = await queryTable(
              ddb,
              process.env.WEBSOCKETS_TABLE_NAME,
              WEBSOCKET_TABLE_RANGE_KEY,
              connectionIdFromRequest
            )
            expect(connectionsAfterClose.length).toBe(0)
            done()
          } else {
            ws.close()
            done.fail(new Error('0 websockets in ddb'))
          }
        }
      })
    })
  })
})