const AWS = require('aws-sdk')
const WebSocket = require('ws')
const uuid = require ('uuid')

const {
  createNotifications,
  deleteNotifications,
  createAccount,
  deleteAccount,
  getToken,
} = require('./utils/integrationTestHelpers')

const {
  TEST_ACCOUNT,
  createTwentyFivePendingNotifications
} = require('./utils/testData')

// process.env.AWS_REGION
// process.env.SECRET
// process.env.CLIENT_ID
// process.env.POOL_ID
// process.env.WSS_CLIENT_URL

const ddb = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION })
const cognitoIdsp = new AWS.CognitoIdentityServiceProvider()

const thirtyPending = createTwentyFivePendingNotifications(
  uuid,
  Date.now(),
  TEST_ACCOUNT
)

beforeAll(async () => {
  jest.setTimeout(15000)
  await createAccount(
    cognitoIdsp,
    process.env.CLIENT_ID,
    TEST_ACCOUNT,
    process.env.SECRET
  )
  await createNotifications(
    ddb,
    process.env.NOTIFICATIONS_TABLE_NAME,
    thirtyPending
  )
})

afterAll(async() => {
  await deleteAccount(
    cognitoIdsp,
    process.env.POOL_ID,
    TEST_ACCOUNT
  )
  await deleteNotifications(
    ddb,
    process.env.NOTIFICATIONS_TABLE_NAME,
    thirtyPending
  )
})

describe('notification pending lambda', () => {
  test('retrieves last 20 pending notifications in descending sequence', async done => {
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
        let pending = event.pending
        ws.close()
        if (!pending.length) {
          console.log('0 pending notifications available for test')
          done()
        }
        expect(pending.length).toBe(20)
        expect(pending[0].timestamp).toBe(pending[1].timestamp + 1)
        expect(pending[1].timestamp).toBe(pending[2].timestamp + 1)
        expect(pending[2].timestamp).toBe(pending[3].timestamp + 1)
        done()
      })
    })
  })

  test('retrieves last 4 pending notifications in descending sequence', async done => {
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
        count: 4,
        token
      })
      ws.send(getNotificationsAction)
      ws.on('message', async data => {
        let event = JSON.parse(data)
        let pending = event.pending
        ws.close()
        if (!pending.length) {
          console.log('0 pending notifications available for test')
          done()
        }
        expect(pending.length).toBe(4)
        expect(pending[0].timestamp).toBe(pending[1].timestamp + 1)
        expect(pending[1].timestamp).toBe(pending[2].timestamp + 1)
        expect(pending[2].timestamp).toBe(pending[3].timestamp + 1)
        done()
      })
    })
  })
})