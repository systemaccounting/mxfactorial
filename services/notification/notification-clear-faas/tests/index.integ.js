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

// avoid const assignment for env vars 
// process.env.AWS_REGION
// process.env.NOTIFICATIONS_TABLE_NAME
// process.env.SECRET
// process.env.CLIENT_ID
// process.env.POOL_ID
// process.env.WSS_CLIENT_URL

const GET_NOTIFICATIONS_ACTION = {"action":"getnotifications"}


const ddb = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION})
const cognitoIdsp = new AWS.CognitoIdentityServiceProvider()


beforeAll(async () => {
  await createAccount(cognitoIdsp, process.env.CLIENT_ID, TEST_ACCOUNT, process.env.SECRET)
})

afterAll(async() => {
  await deleteAccount(cognitoIdsp, process.env.POOL_ID, TEST_ACCOUNT)
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

describe('notification pending lambda', () => {
  test('clears 1 pending message', async done => {
    let token = await getToken(cognitoIdsp, process.env.CLIENT_ID, TEST_ACCOUNT, process.env.SECRET)
    let options = {
      headers: { Authorization: token }
    }
    let ws = new WebSocket(process.env.WSS_CLIENT_URL, options)
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