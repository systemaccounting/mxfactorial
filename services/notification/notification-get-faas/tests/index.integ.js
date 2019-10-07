const AWS = require('aws-sdk')
const WebSocket = require('ws')

const {
  createNotifications,
  deleteNotifications,
  createAccount,
  deleteAccount,
  getToken,
} = require('./utils/integrationTestHelpers')

const {
  TEST_ACCOUNT,
  pendingReceivedNotifications,
} = require('./utils/testData')

const AWS_REGION = process.env.AWS_REGION
const NOTIFICATIONS_TABLE_NAME = process.env.NOTIFICATIONS_TABLE_NAME
const SECRET = process.env.SECRET
const GET_NOTIFICATIONS_ACTION = {"action":"getnotifications"}
const CLIENT_ID = process.env.CLIENT_ID
const POOL_ID = process.env.POOL_ID
const WSS_CLIENT_URL = process.env.WSS_CLIENT_URL

const ddb = new AWS.DynamoDB.DocumentClient({ region: AWS_REGION })
const cognitoIdsp = new AWS.CognitoIdentityServiceProvider()


beforeAll(async () => {
  await createAccount(cognitoIdsp, CLIENT_ID, TEST_ACCOUNT, SECRET)
})

afterAll(async() => {
  await deleteAccount(cognitoIdsp, POOL_ID, TEST_ACCOUNT)
})

beforeEach(async () => {
  await createNotifications(
    ddb,
    NOTIFICATIONS_TABLE_NAME,
    pendingReceivedNotifications
  )
})

afterEach(async () => {
  await deleteNotifications(
    ddb,
    NOTIFICATIONS_TABLE_NAME,
    pendingReceivedNotifications
  )
})

describe('notification pending lambda', () => {
  test('client recevies 3 pending notifications', async done => {
    let token = await getToken(cognitoIdsp, CLIENT_ID, TEST_ACCOUNT, SECRET)
    let options = {
      headers: { Authorization: token }
    }
    let ws = new WebSocket(WSS_CLIENT_URL, options)
    ws.on('open', () => {
      ws.send(JSON.stringify(GET_NOTIFICATIONS_ACTION))
      ws.on('message', async data => {
        let event = JSON.parse(data)
        let pending = event.pending
        ws.close()
        if (!pending.length) {
          console.log('0 pending notifications available for test')
          done()
        }
        expect(pending.length).toBe(3)
        done()
      })
    })
  }, 10000)
})