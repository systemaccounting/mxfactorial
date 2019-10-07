const AWS = require('aws-sdk')
const WebSocket = require('ws')

const {
  createAccount,
  deleteAccount,
  getToken,
  queryIndex
} = require('./utils/integrationTestHelpers')

const randomFourDigitInt = () => {
  return Math.floor(Math.random() * (9999 - 1000)) + 1000
}

const TEST_ACCOUNT = `FakerAccount${randomFourDigitInt()}`
const SECRET = process.env.SECRET
const CLIENT_ID = process.env.CLIENT_ID
const POOL_ID = process.env.POOL_ID
const WSS_CLIENT_URL = process.env.WSS_CLIENT_URL
const AWS_REGION = process.env.AWS_REGION
const WEBSOCKETS_TABLE_NAME = process.env.WEBSOCKETS_TABLE_NAME
const WEBSOCKET_ATTRIBUTE = 'account'
const WEBSOCKET_INDEX_NAME = `${WEBSOCKET_ATTRIBUTE}-index`

const cognitoIdsp = new AWS.CognitoIdentityServiceProvider()
const ddb = new AWS.DynamoDB.DocumentClient({ region: AWS_REGION })

beforeAll(async () => {
  await createAccount(cognitoIdsp, CLIENT_ID, TEST_ACCOUNT, SECRET)
})

afterAll(async() => {
  await deleteAccount(cognitoIdsp, POOL_ID, TEST_ACCOUNT)
})


let timeout = ms => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`waiting ${ms} ms`)
      resolve()
    }, ms)
  })
}

describe('websocket connection lambda', () => {
  test('websocket connects', async done => {
    let token = await getToken(cognitoIdsp, CLIENT_ID, TEST_ACCOUNT, SECRET)
    let options = {
      headers: { Authorization: token }
    }
    let ws = new WebSocket(WSS_CLIENT_URL, options)
    let opened
    ws.on('open', () => {
      opened = 1
      ws.close()
      expect(opened).toBe(1)
      done()
    })
  }, 10000)

  test('connection id stored in dynamodb on CONNECT', async done => {
    let token = await getToken(cognitoIdsp, CLIENT_ID, TEST_ACCOUNT, SECRET)
    let options = {
      headers: { Authorization: token }
    }
    let ws = new WebSocket(WSS_CLIENT_URL, options)
    ws.on('open', async () => {
      let connections = await queryIndex(
        ddb,
        WEBSOCKETS_TABLE_NAME,
        WEBSOCKET_INDEX_NAME,
        WEBSOCKET_ATTRIBUTE,
        TEST_ACCOUNT
      )
      ws.close()
      expect(connections.length).toBeGreaterThan(0)
      done()
    })
  }, 10000)

  test('connection id removed from dynamodb on DISCONNECT', async done => {
    let token = await getToken(cognitoIdsp, CLIENT_ID, TEST_ACCOUNT, SECRET)
    let options = {
      headers: { Authorization: token }
    }
    let ws = new WebSocket(WSS_CLIENT_URL, options)
    ws.on('open', async () => {
      let connections = await queryIndex(
        ddb,
        WEBSOCKETS_TABLE_NAME,
        WEBSOCKET_INDEX_NAME,
        WEBSOCKET_ATTRIBUTE,
        TEST_ACCOUNT
      )
      if (connections.length > 0) {
        ws.close()
        await timeout(1e3)
        let connectionsAfterClose = await queryIndex(
          ddb,
          WEBSOCKETS_TABLE_NAME,
          WEBSOCKET_INDEX_NAME,
          WEBSOCKET_ATTRIBUTE,
          TEST_ACCOUNT
        )
        expect(connectionsAfterClose.length).toBe(0)
        done()
      } else {
        ws.close()
        done.fail(new Error('0 websockets in ddb'))
      }
    })
  }, 10000)
})