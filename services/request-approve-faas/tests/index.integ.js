const AWS = require('aws-sdk')
const Sequelize = require('sequelize')

const lambda = new AWS.Lambda({
  region: process.env.AWS_REGION
})

const ddb = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION })

const {
  invokeLambda,
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
// process.env.REQUEST_CREATE_LAMBDA_ARN
// process.env.REQUEST_APPROVE_LAMBDA_ARN

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

let request // used for testing and teardown
beforeEach(async() => {
  let response = await invokeLambda(
    lambda,
    process.env.REQUEST_CREATE_LAMBDA_ARN,
    itemsStandardArray,
    TEST_ACCOUNTS[1]
  )
   // !!! save transactions for teardown in each test
   request = response.data
})

afterEach(async() => {
  // delete test transaction requests added in postgres
  await deleteFromPgTable(
    transactionsTable,
    'transaction_id',
    request[0].transaction_id
  )

  // delete test notifications added in dynamodb
  let notificationsToDelete
  attemptloop: // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label
  for (let attempt = 1; attempt < 5; attempt++) { // retry delayed notifications delivered by sns
    notificationsToDelete = await queryDynamaDbTable(
      ddb,
      process.env.NOTIFICATIONS_TABLE_NAME,
      'uuid',
      request[0].transaction_id
    )
    if (notificationsToDelete.length !== 6) { // notifications not in dynamodb yet
      await sleep(5000) // wait 5 seconds
      continue attemptloop // start over
    } else {
      break attemptloop
    }
  }
  if (notificationsToDelete.length !== 6) { // log failure if attempts fail
    console.log('failed to find and delete notifications from test')
  } else {
    await deleteMultipleNotifications( // delete notifications
      ddb,
      process.env.NOTIFICATIONS_TABLE_NAME,
      notificationsToDelete
    )
  }
  request = []
})

describe('approve request service', () => {
  test('approves debit request in postgres', async () => {
    let response = await invokeLambda(
      lambda,
      process.env.REQUEST_APPROVE_LAMBDA_ARN,
      request,
      TEST_ACCOUNTS[0]
    )
    expect(response.data[0].debitor_approval_time).toBeTruthy()
    expect(response.data[1].debitor_approval_time).toBeTruthy()
  })
})

