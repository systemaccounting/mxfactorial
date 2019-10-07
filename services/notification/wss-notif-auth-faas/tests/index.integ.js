const AWS = require('aws-sdk')
const WebSocket = require('ws')

const {
  createAccount,
  deleteAccount,
  getToken
} = require('./utils/integrationTestHelpers')

const randomFourDigitInt = () => {
  return Math.floor(Math.random() * (9999 - 1000)) + 1000
}

const ACCOUNT = `FakerAccount${randomFourDigitInt()}`
const SECRET = process.env.SECRET
const CLIENT_ID = process.env.CLIENT_ID
const POOL_ID = process.env.POOL_ID
const WSS_CLIENT_URL = process.env.WSS_CLIENT_URL

const cognitoIdsp = new AWS.CognitoIdentityServiceProvider()


beforeAll(async () => {
  await createAccount(cognitoIdsp, CLIENT_ID, ACCOUNT, SECRET)
})

afterAll(async() => {
  await deleteAccount(cognitoIdsp, POOL_ID, ACCOUNT)
})

describe('authorizer lambda', () => {
  test('websocket authorized', async done => {
    let token = await getToken(cognitoIdsp, CLIENT_ID, ACCOUNT, SECRET)
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
})