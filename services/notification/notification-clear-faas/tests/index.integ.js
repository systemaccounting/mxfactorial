const AWS = require('aws-sdk')
const WebSocket = require('ws')

const {
  createNotifications,
  deleteNotifications,
  createAccount,
  deleteAccount,
  getToken,
  shapeClearNotificationsRequest
} = require('./utils/integrationTestHelpers')

const {
  TEST_ACCOUNT,
  pendingReceivedNotifications
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
  test('clears 1 pending message', async done => {
    let token = await getToken(cognitoIdsp, CLIENT_ID, TEST_ACCOUNT, SECRET)
    let options = {
      headers: { Authorization: token }
    }
    let ws = new WebSocket(WSS_CLIENT_URL, options)
    ws.on('open', () => {
      ws.send(JSON.stringify(GET_NOTIFICATIONS_ACTION))
      ws.on('message', data => {
        let event = JSON.parse(data)
        if (event.message === 'Internal server error') {
          ws.close()
          done()
          throw event
        }
        if (event.pending) {
          let pending = event.pending
          if (!pending.length) {
            ws.close()
            console.log('0 pending notifications available for test')
            done()
          }
          let clearMessageRequest = shapeClearNotificationsRequest(pending)
          ws.send(clearMessageRequest, () => {
            ws.on('message', data => {
              let event = JSON.parse(data)
              if (event.cleared) {
                let cleared = event.cleared
                if (!cleared.length) {
                  ws.close()
                  console.log('0 cleared notifications available for test')
                  done()
                }
                ws.close()
                expect(cleared.length).toBe(1)
                done()
              }
            })
          })
        }
      })
    })
  }, 10000)

  // todo: assert notification table length - 1 after clear action
})