const AWS = require('aws-sdk')
const Sequelize = require('sequelize')

const lambda = new AWS.Lambda({
  region: process.env.AWS_REGION
})

const ddb = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION })

const {
  invokeLambda,
  queryPgTable,
  deleteFromPgTable,
  queryDynamaDbTable,
  deleteMultipleNotifications
} = require('./utils/integrationTestHelpers')

const {
  TEST_ACCOUNTS,
  itemsStandardArray,
} = require('./utils/testData')

const {
  connection,
  tableModel
} = require('./utils/postgres')

// process.env.NOTIFICATIONS_TABLE_NAME
// process.env.PGDATABASE
// process.env.PGUSER
// process.env.PGPASSWORD
// process.env.PGHOST
// process.env.PGPORT

// https://stackoverflow.com/questions/14249506/how-can-i-wait-in-node-js-javascript-l-need-to-pause-for-a-period-of-time#comment88208673_41957152
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const transactionsTable = tableModel(
  connection,
  'transactions',
  Sequelize,
)

beforeAll(async () => {
  jest.setTimeout(30000)
})

afterAll(async () => {
  connection.close().then(() => console.log('postgres connection closed'))
})

let transactionIDsToTeardown = []
afterEach(async() => {
  // delete test transaction requests added in postgres
  for (let transactionID of transactionIDsToTeardown) {
    await deleteFromPgTable(
      transactionsTable,
      'transaction_id',
      transactionID
    )
  }

  // delete test notifications added in dynamodb
  for (let notificationID of transactionIDsToTeardown) {
    let notificationsToDelete
    attemptloop: // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label
    for (let attempt = 1; attempt < 5; attempt++) { // retry delayed notifications delivered by sns
      notificationsToDelete = await queryDynamaDbTable(
        ddb,
        process.env.NOTIFICATIONS_TABLE_NAME,
        'uuid',
        notificationID
      )
      if (notificationsToDelete.length !== 3) { // notifications not in dynamodb yet
        await sleep(3000) // wait 3 seconds
        continue attemptloop // start over
      } else {
        break attemptloop
      }
    }
    if (notificationsToDelete.length !== 3) { // log failure if attempts fail
      console.log('failed to find and delete notifications from test')
    } else {
      await deleteMultipleNotifications( // delete notifications
        ddb,
        process.env.NOTIFICATIONS_TABLE_NAME,
        notificationsToDelete
      )
    }
  }
  transactionIDsToTeardown = []
})

describe('create request service', () => {
  test('creates rules-adjusted transaction requests in postgres', async () => {
    await invokeLambda(
      lambda,
      {
        items: itemsStandardArray,
        graphqlRequestSender: TEST_ACCOUNTS[1]
      }
    )
    const requestsInDb = await queryPgTable(
      transactionsTable,
      'author',
      TEST_ACCOUNTS[1]
    )
     // !!! always push transactions for teardown in each test
    transactionIDsToTeardown.push(requestsInDb[0].transaction_id)
    expect(requestsInDb).toHaveLength(2)
  })
})

