const AWS = require('aws-sdk')
const Sequelize = require('sequelize')

const lambda = new AWS.Lambda({
  region: process.env.AWS_REGION
})

const ddb = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION })

const {
  invokeLambda,
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
// process.env.REQUEST_APPROVE_LAMBDA_ARN

// set test values in modules to avoid failure from
// teardown of shared values in unfinished parallel tests
const TEST_DEBITOR = fakerAccountWithSevenRandomDigits()
const TEST_CREDITOR = fakerAccountWithSevenRandomDigits()
const debitRequest = createRequestData(
  TEST_DEBITOR,
  TEST_CREDITOR,
  'debit'
)

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

let requests = [] // used for testing and teardown
beforeEach(async() => {
  let response = await invokeLambda(
    lambda,
    process.env.REQUEST_CREATE_LAMBDA_ARN,
    debitRequest,
    TEST_CREDITOR
  )
  // !!! save transactions for teardown in each test
  requests.push(...response.data)
})

afterEach(async() => {
  // delete test transaction requests added in postgres
  for (let req of requests) {
    await deleteFromPgTable(
      transactionsTable,
      'transaction_id',
      req.transaction_id
    )
  }
  let transactionIDs = requests.map(i => i.transaction_id)
  let uniqueIDs = [ ...new Set(transactionIDs)]
  // delete test notifications added in dynamodb
  await tearDownNotifications(ddb, uniqueIDs, 6)
  requests = []
})

describe('approve request service', () => {
  test('approves debit request in postgres', async () => {
    let response = await invokeLambda(
      lambda,
      process.env.REQUEST_APPROVE_LAMBDA_ARN,
      requests,
      TEST_DEBITOR
    )
    expect(response.data[0].debitor_approval_time).toBeTruthy()
    expect(response.data[1].debitor_approval_time).toBeTruthy()
  })

  // todo: approve credit request

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
  //     accpunt: TEST_DEBITOR
  //   })
  //   response.transactions.forEach(item => {
  //     expect([item.debitor, item.creditor, item.author]).toContain(TEST_DEBITOR)
  //   })
  // })
})

