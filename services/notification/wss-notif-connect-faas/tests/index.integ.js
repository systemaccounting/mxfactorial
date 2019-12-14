const AWS = require('aws-sdk')
const WebSocket = require('ws')
const Sequelize = require('sequelize')

const {
  createAccount,
  deleteAccount,
  queryTable
} = require('./utils/integrationTestHelpers')

const randomFourDigitInt = () => {
  return Math.floor(Math.random() * (9999 - 1000)) + 1000
}

// process.env.SECRET
// process.env.CLIENT_ID
// process.env.POOL_ID
// process.env.process.env.WSS_CLIENT_URL
// process.env.AWS_REGION
// process.env.PGDATABASE
// process.env.PGUSER
// process.env.PGPASSWORD
// process.env.PGHOST
// process.env.PGPORT

const TEST_ACCOUNT = `FakerAccount${randomFourDigitInt()}`

const cognitoIdsp = new AWS.CognitoIdentityServiceProvider()

const notificationWebsocketsModel = (sequelize, sequelizeType) => {
  return sequelize.define(
    'notification_websockets',
    {
      id: {
        type: sequelizeType.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      connection_id: sequelizeType.STRING,
      created_at: sequelizeType.DATE,
      epoch_created_at: sequelizeType.BIGINT,
      account: sequelizeType.STRING
    },
    {
      timestamps: false
    }
  )
}

const pgConnection = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    operatorAliases: false,
    logging: console.log,
    port: process.env.PGPORT,
    dialect: 'postgres',
    pool: {
      min: 0,
      max: 5,
      acquire: 30000,
      idle: 10000
    }
  }
)

const notificationWebsocketsTable = notificationWebsocketsModel(
  pgConnection,
  Sequelize
)

beforeAll(async () => {
  jest.setTimeout(15000)
  await createAccount(
    cognitoIdsp,
    process.env.CLIENT_ID,
    TEST_ACCOUNT,
    process.env.SECRET
  )
})

afterAll(async() => {
  await deleteAccount(
    cognitoIdsp,
    process.env.POOL_ID,
    TEST_ACCOUNT
  )
  pgConnection.close().then(() => console.log('postgres connection closed'))
})


let timeout = ms => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log(`waiting ${ms/1000} sec`)
      resolve()
    }, ms)
  })
}

describe('websocket connection lambda', () => {
  test('websocket connects', async done => {
    let ws = new WebSocket(process.env.WSS_CLIENT_URL)
    let opened
    ws.on('open', () => {
      opened = 1
      ws.close()
      expect(opened).toBe(1)
      done()
    })
  })

  test('connection id stored in postgres on CONNECT', async done => {
    let ws = new WebSocket(process.env.WSS_CLIENT_URL)
    ws.on('open', async () => {
      await timeout(1e3) // wait for addition of connection id in postgres
      ws.send(JSON.stringify({ action: 'getnotifications', token: '' })) // return error with connection id
      ws.on('message', async data => {
        if (JSON.parse(data).connectionId) {
          let connectionIdFromRequest = JSON.parse(data).connectionId
          let connectionRecord = await queryTable(
            notificationWebsocketsTable,
            connectionIdFromRequest
          )
          ws.close()
          expect(connectionRecord.connection_id).toBe(connectionIdFromRequest)
          done()
        }
      })
    })
  })

  test('connection id removed from postgres on DISCONNECT', async done => {
    let ws = new WebSocket(process.env.WSS_CLIENT_URL)
    ws.on('open', async () => {
      ws.send(JSON.stringify({ action: 'getnotifications', token: '' })) // return error with connection id
      ws.on('message', async data => {
        if (JSON.parse(data).connectionId) {
          let connectionIdFromRequest = JSON.parse(data).connectionId
          let connectionIdFromPostgres = await queryTable(
            notificationWebsocketsTable,
            connectionIdFromRequest
          )
          if (connectionIdFromPostgres) {
            ws.close()
            await timeout(1e3) // wait for removal of connection id record in db
            let connectionsAfterClose = await queryTable(
              notificationWebsocketsTable,
              connectionIdFromRequest
            )
            expect(connectionsAfterClose).toBeNull()
            done()
          } else {
            ws.close()
            done.fail(new Error('0 websockets in postgres'))
          }
        }
      })
    })
  })
})