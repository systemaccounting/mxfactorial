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
  tearDownNotifications
} = require('./utils/integrationTestHelpers')

const {
  fakerAccountWithSevenRandomDigits,
  createRequestData
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

// set test values in modules to avoid failure from
// teardown of shared values in unfinished parallel tests
const TEST_DEBITOR = fakerAccountWithSevenRandomDigits()
const TEST_CREDITOR = fakerAccountWithSevenRandomDigits()
const debitRequest = createRequestData(
  TEST_DEBITOR,
  TEST_CREDITOR,
  'debit'
)

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
  await tearDownNotifications(ddb, transactionIDsToTeardown, 3)
  transactionIDsToTeardown = [] // reset after teardown
})

describe('create request service', () => {
  test('creates rules-adjusted debit request in postgres', async () => {
    await invokeLambda(lambda, debitRequest, TEST_CREDITOR)
    const requestsInDb = await queryPgTable(
      transactionsTable,
      'author',
      TEST_CREDITOR
    )

    expect(requestsInDb).toHaveLength(2)
    expect(requestsInDb[0].creditor_approval_time).toBeTruthy()
    expect(requestsInDb[1].creditor_approval_time).toBeTruthy()
    expect(requestsInDb[0].debitor_approval_time).toBeFalsy()
    expect(requestsInDb[1].debitor_approval_time).toBeFalsy()

    // push transactions for teardown in each test
    transactionIDsToTeardown.push(requestsInDb[0].transaction_id)
  })

  // todo: test credit request

  // it('sets debitor_approval_time if author === debitor', async () => {
  //   let response = await creditorGraphQLClient.request(createRequest, {
  //     items: debitRequest
  //   })
  //   response.createRequest.forEach(item => {
  //     if (item.author === item.debitor) {
  //       expect(item.creditor_approval_time).toBeNull()
  //       expect(item.debitor_approval_time).not.toBeNull()
  //     }
  //   })
  // })

  // it('sets creditor_approval_time if author === creditor', async () => {
  //   let response = await creditorGraphQLClient.request(createRequest, {
  //     items: creditRequest
  //   })
  //   response.createRequest.forEach(item => {
  //     if (item.author === item.creditor) {
  //       expect(item.creditor_approval_time).not.toBeNull()
  //       expect(item.debitor_approval_time).toBeNull()
  //     }
  //   })
  // })

  // // todo: test creditor != cognito account
  // it('returns debit and credit requests matching authenticated account', async () => {
  //   let response = await creditorGraphQLClient.request(requestsByAccount, {
  //     accpunt: TEST_CREDITOR
  //   })
  //   response.transactions.forEach(item => {
  //     expect([item.debitor, item.creditor, item.author]).toContain(TEST_CREDITOR)
  //   })
  // })
})

