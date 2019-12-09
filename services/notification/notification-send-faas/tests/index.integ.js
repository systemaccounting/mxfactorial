const AWS = require('aws-sdk')
const WebSocket = require('ws')
const Sequelize = require('sequelize')

const {
  deleteNotifications,
  createAccount,
  deleteAccount,
  getToken,
  sendNotifications,
  queryIndex,
  queryTable,
  insert,
  deleteFromTable
} = require('./utils/integrationTestHelpers')

const {
  connection,
  tableModel
} = require('../lib/postgres')


const {
  transactIntegrationTestEvent,
  recipientListIntegrationTests,
  TEST_ACCOUNT
} = require('./utils/testData')


// env var inventory
// process.env.AWS_REGION
// process.env.NOTIFICATIONS_TABLE_NAME
// process.env.SECRET
// process.env.CLIENT_ID
// process.env.POOL_ID
// process.env.WSS_CLIENT_URL
// process.env.NOTIFY_TOPIC_ARN
// process.env.PGDATABASE
// process.env.PGUSER
// process.env.PGPASSWORD
// process.env.PGHOST
// process.env.PGPORT

const ddb = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION })
const cognitoIdsp = new AWS.CognitoIdentityServiceProvider()
const sns = new AWS.SNS()

const websocketsTable = tableModel(
  connection,
  Sequelize,
  'notification_websockets',
)

const timeout = ms => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

beforeAll(async () => {
  jest.setTimeout(30000)
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
  await deleteFromTable(websocketsTable, TEST_ACCOUNT)
  connection.close().then(() => console.log('postgres connection closed'))
})

let storedNotifications = []
beforeEach(async () => {
  await sendNotifications(
    sns,
    process.env.NOTIFY_TOPIC_ARN,
    transactIntegrationTestEvent
  )
  await timeout(5e3) // wait 5 second for sns -> lambda -> ddb
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
  storedNotifications = []
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
    let ws = new WebSocket(process.env.WSS_CLIENT_URL)
    ws.on('open', () => {
      let getNotificationsAction = JSON.stringify({
        action: "getnotifications",
        token
      })
      ws.send(getNotificationsAction)
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
  })

  test('properties in pending transaction notification objects', async done => {
    let token = await getToken(
      cognitoIdsp,
      process.env.CLIENT_ID,
      TEST_ACCOUNT,
      process.env.SECRET
    )
    let ws = new WebSocket(process.env.WSS_CLIENT_URL)
    ws.on('open', () => {
      let getNotificationsAction = JSON.stringify({
        action: "getnotifications",
        token
      })
      ws.send(getNotificationsAction)
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
  })

  test('deletes expired websocket from postgres', async () => {
    // create expired websocket record
    let testconnectionid = 'EbpcocZ1oAMCI1Q='
    let testtimestamp = 1575887543160
    await insert(websocketsTable, testconnectionid, testtimestamp, TEST_ACCOUNT)
    // send notification
    let token = await getToken(
      cognitoIdsp,
      process.env.CLIENT_ID,
      TEST_ACCOUNT,
      process.env.SECRET
    )
    let ws = new WebSocket(process.env.WSS_CLIENT_URL)
    ws.on('open', () => {
      let getNotificationsAction = JSON.stringify({
        action: "getnotifications",
        token
      })
      ws.send(getNotificationsAction)
      ws.on('message', async data => {
        let event = JSON.parse(data)
        if (event.message === 'Internal server error') {
          ws.close()
          done()
          throw event
        }
        ws.close()
        await timeout(5e3) // wait 5 second for lambda to remove websocket db record
        // query db for expired record
        let websocketRecordsInPostgres = await queryTable(
          websocketsTable,
          TEST_ACCOUNT
        )
        // filter expired connection
        let recordsContainingExpiredWebsocket = websocketRecordsInPostgres.filter(record => {
          return record.connection_id = testconnectionid
        })
        expect(recordsContainingExpiredWebsocket).toHaveLength(0)
        done()
      })
    })
  })
})