const AWS = require('aws-sdk')
const WebSocket = require('ws')

const {
  deleteNotifications,
  createAccount,
  deleteAccount,
  getToken,
  sendNotifications,
  queryIndex
} = require('./utils/integrationTestHelpers')

const {
  transactIntegrationTestEvent,
  recipientListIntegrationTests,
  TEST_ACCOUNT
} = require('./utils/testData')

const AWS_REGION = process.env.AWS_REGION
const NOTIFICATIONS_TABLE_NAME = process.env.NOTIFICATIONS_TABLE_NAME
const SECRET = process.env.SECRET
const GET_NOTIFICATIONS_ACTION = {"action":"getnotifications"}
const CLIENT_ID = process.env.CLIENT_ID
const POOL_ID = process.env.POOL_ID
const WSS_CLIENT_URL = process.env.WSS_CLIENT_URL
const NOTIFY_TOPIC_ARN= process.env.NOTIFY_TOPIC_ARN

const ddb = new AWS.DynamoDB.DocumentClient({ region: AWS_REGION })
const cognitoIdsp = new AWS.CognitoIdentityServiceProvider()
const sns = new AWS.SNS()

const timeout = ms => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

beforeAll(async () => {
  await createAccount(cognitoIdsp, CLIENT_ID, TEST_ACCOUNT, SECRET)
})

afterAll(async () => {
  await deleteAccount(cognitoIdsp, POOL_ID, TEST_ACCOUNT)
})

let storedNotifications = []
beforeEach(async () => {
  await sendNotifications(sns, NOTIFY_TOPIC_ARN, transactIntegrationTestEvent)
  await timeout(2e3) // wait 2 second for sns -> lambda -> ddb
  for (account of recipientListIntegrationTests) {
    let queryResult = await queryIndex(
      ddb,
      NOTIFICATIONS_TABLE_NAME,
      'account-index',
      'account',
      account
    )
    storedNotifications.push(...queryResult)
  }
})

afterEach(async () => {
  await deleteNotifications(ddb, NOTIFICATIONS_TABLE_NAME, storedNotifications)
})

describe('notification send lambda', () => {
  test('stores 3 notifications', async () => {
    expect(storedNotifications.length).toBe(3)
  })

  test('sends client 1 pending notification', async done => {
    let token = await getToken(cognitoIdsp, CLIENT_ID, TEST_ACCOUNT, SECRET)
    let options = {
      headers: { Authorization: token }
    }
    let ws = new WebSocket(WSS_CLIENT_URL, options)
    ws.on('open', () => {
      ws.send(JSON.stringify(GET_NOTIFICATIONS_ACTION))
      ws.on('message', async data => {
        let event = JSON.parse(data)
        if (event.message === 'Internal server error') {
          ws.close()
          done()
          throw event
        }
        console.log(event)
        let pending = event.pending
        ws.close()
        if (!pending.length) {
          console.log('0 pending notifications available for test')
          done()
        }
        expect(pending.length).toBe(1)
        done()
      })
    })
  }, 10000)

  test('properties in pending transaction notification objects', async done => {
    let token = await getToken(cognitoIdsp, CLIENT_ID, TEST_ACCOUNT, SECRET)
    let options = {
      headers: { Authorization: token }
    }
    let ws = new WebSocket(WSS_CLIENT_URL, options)
    ws.on('open', () => {
      ws.send(JSON.stringify(GET_NOTIFICATIONS_ACTION))
      ws.on('message', async data => {
        let event = JSON.parse(data)
        if (event.message === 'Internal server error') {
          ws.close()
          done()
          throw event
        }
        console.log(event)
        let pending = event.pending
        ws.close()
        if (!pending.length) {
          console.log('0 pending notifications available for test')
          done()
        }
        let keys = [
          'account',
          'human_timestamp',
          'uuid',
          'message',
          'timestamp'
        ]
        let result = Object.keys(pending[0])
        expect(result).toEqual(keys)
        done()
      })
    })
  }, 10000)
})