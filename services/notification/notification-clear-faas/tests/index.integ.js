const AWS = require('aws-sdk')
const WebSocket = require('ws')
const Sequelize = require('sequelize')

const {
  createNotifications,
  deleteNotifications,
  createAccount,
  deleteAccount,
  getToken,
  shapeClearNotificationsRequest,
  queryTable
} = require('./utils/integrationTestHelpers')

const {
  connection,
  tableModel
} = require('../lib/postgres')

const {
  TEST_ACCOUNT,
  pendingReceivedNotifications
} = require('./utils/testData')

// avoid const assignment for env vars
// process.env.AWS_REGION
// process.env.SECRET
// process.env.CLIENT_ID
// process.env.POOL_ID
// process.env.WSS_CLIENT_URL
// process.env.PGDATABASE
// process.env.PGUSER
// process.env.PGPASSWORD
// process.env.PGHOST
// process.env.PGPORT

const ddb = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION})
const cognitoIdsp = new AWS.CognitoIdentityServiceProvider()

let websocketsTable = tableModel(
  connection,
  Sequelize,
  'notification_websockets',
)

beforeAll(async () => {
  jest.setTimeout(15000)
  await createAccount(cognitoIdsp, process.env.CLIENT_ID, TEST_ACCOUNT, process.env.SECRET)
})

afterAll(async() => {
  await deleteAccount(cognitoIdsp, process.env.POOL_ID, TEST_ACCOUNT)
  connection.close().then(() => console.log('postgres connection closed'))
})

beforeEach(async () => {
  await createNotifications(
    ddb,
    process.env.NOTIFICATIONS_TABLE_NAME,
    pendingReceivedNotifications
  )
})

afterEach(async () => {
  await deleteNotifications(
    ddb,
    process.env.NOTIFICATIONS_TABLE_NAME,
    pendingReceivedNotifications
  )
})

const timeout = ms => {
  return new Promise(resolve => {
    console.log(`waiting ${ms/1000} secs`)
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

describe('notification pending lambda', () => {
  test('clears 1 pending message', async done => {
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
      ws.on('message', data => {
        let event = JSON.parse(data)
        if (event.message) {
          if (event.message === 'Internal server error') {
            ws.close()
            done()
            throw event
          }
        }
        if (event.pending) {
          if (!event.pending.length) {
            ws.close()
            console.log('0 pending notifications available for test')
            done()
          }
        }
        if (event.cleared) {
          if (event.cleared.length) {
            ws.close()
            console.log('0 cleared notifications available for test')
            done()
          }
          ws.close()
          expect(event.cleared.length).toBe(1)
          done()
        }
        let clearNotificationsRequest = shapeClearNotificationsRequest(
          'clearnotifications',
          pending,
          token
        )
        ws.send(clearNotificationsRequest)
        ws.close()
        done()
      })
    })
  })

  test('missing token in clearnotifications request returns error', async done => {
    let expected = 'Internal server error'
    let ws = new WebSocket(process.env.WSS_CLIENT_URL)
    ws.on('open', () => {
      let clearNotificationsRequest = JSON.stringify({
        action: "clearnotifications",
        notifications: pendingReceivedNotifications,
        token: ""
      })
      ws.send(clearNotificationsRequest)
      ws.on('message', async data => {
        let event = JSON.parse(data)
        ws.close()
        expect(event.message).toBe(expected)
        done()
      })
    })
  })

  test('account attribute added to dynamodb connection id record storing created_at timestamp', async done => {
    let token = await getToken(
      cognitoIdsp,
      process.env.CLIENT_ID,
      TEST_ACCOUNT,
      process.env.SECRET
    )
    let ws = new WebSocket(process.env.WSS_CLIENT_URL)
    ws.on('open', async () => {
      let clearNotificationsRequest = JSON.stringify({
        action: "clearnotifications",
        notifications: pendingReceivedNotifications,
        token // send authed request to add account attribute to websocket db record
      })
      ws.send(clearNotificationsRequest)
      await timeout(2e3) // wait 2 second for lambda to update websocket db record
      let websocketRecordsInPostgres = await queryTable(
        websocketsTable,
        TEST_ACCOUNT
      )
      let getConnectionIdFromErrorMessage = JSON.stringify({
        action: "getnotifications",
        token: ""
      })
      ws.send(getConnectionIdFromErrorMessage)
      ws.on('message', data => {
        if (JSON.parse(data).connectionId) {
          let connectionId = JSON.parse(data).connectionId
          ws.close()
          let currentRecord = websocketRecordsInPostgres.filter(record => {
            return record.connection_id == connectionId
          })
          expect(currentRecord[0].created_at).toBeTruthy()
          expect(currentRecord[0].account).toBe(TEST_ACCOUNT)
          done()
        }
      })
    })
  })

  // todo: assert notification table length - 1 after clear action
})