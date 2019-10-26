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

const GET_NOTIFICATIONS_ACTION = {"action":"getnotifications"}

// env var inventory
// process.env.AWS_REGION
// process.env.NOTIFICATIONS_TABLE_NAME
// process.env.SECRET
// process.env.CLIENT_ID
// process.env.POOL_ID
// process.env.WSS_CLIENT_URL
// process.env.NOTIFY_TOPIC_ARN

const ddb = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION })
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
  await createAccount(
    cognitoIdsp,
    process.env.CLIENT_ID,
    TEST_ACCOUNT,
    process.env.SECRET
  )
})

afterAll(async () => {
  await deleteAccount(
    cognitoIdsp,
    process.env.POOL_ID,
    TEST_ACCOUNT
  )
})

let storedNotifications = []
beforeEach(async () => {
  await sendNotifications(
    sns,
    process.env.NOTIFY_TOPIC_ARN,
    transactIntegrationTestEvent
  )
  await timeout(2e3) // wait 2 second for sns -> lambda -> ddb
  for (account of recipientListIntegrationTests) {
    let queryResult = await queryIndex(
      ddb,
      process.env.NOTIFICATIONS_TABLE_NAME,
      'account-index',
      'account',
      account
    )
    storedNotifications.push(...queryResult)
  }
})

afterEach(async () => {
  await deleteNotifications(
    ddb,
    process.env.NOTIFICATIONS_TABLE_NAME,
    storedNotifications
  )
})

describe('notification send lambda', () => {
  test('stores 3 notifications', async () => {
    expect(storedNotifications.length).toBe(3)
  })

  test('sends client 1 pending notification', async done => {
    let token = await getToken(
      cognitoIdsp,
      process.env.CLIENT_ID,
      TEST_ACCOUNT,
      process.env.SECRET
    )
    let options = {
      headers: { Authorization: token }
    }
    let ws = new WebSocket(process.env.WSS_CLIENT_URL, options)
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
    let token = await getToken(
      cognitoIdsp,
      process.env.CLIENT_ID,
      TEST_ACCOUNT,
      process.env.SECRET
    )
    let options = {
      headers: { Authorization: token }
    }
    let ws = new WebSocket(process.env.WSS_CLIENT_URL, options)
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