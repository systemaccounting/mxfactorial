const AWS = require('aws-sdk')
const { GraphQLClient } = require('graphql-request')
const { tearDownIntegrationTestDataInRDS } = require('../utils/tearDown')
const {
  createRequest,
  approveRequest
} = require('../mutations/requests')

const {
  fakerAccountWithSevenRandomDigits,
  createRequestData
} = require('../utils/testData')

const {
  createAccount,
  deleteAccount,
  getToken,
  tearDownNotifications
} = require('../utils/integrationTestHelpers')

const cognitoIdsp = new AWS.CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION
})
const ddb = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION })

// required env vars
// process.env.NOTIFICATIONS_TABLE_NAME

// set test values in modules to avoid failure from
// teardown of shared values in unfinished parallel tests
const TEST_DEBITOR = fakerAccountWithSevenRandomDigits()
const TEST_CREDITOR = fakerAccountWithSevenRandomDigits()
const debitRequest = createRequestData(
  TEST_DEBITOR,
  TEST_CREDITOR,
  'debit'
)


let debitorGraphQLClient
let creditorGraphQLClient
beforeAll(async () => {
  jest.setTimeout(30000) // lambda cold start
  await createAccount(
    cognitoIdsp,
    process.env.CLIENT_ID,
    TEST_DEBITOR,
    process.env.SECRET
  )
  let debitorToken = await getToken(
    cognitoIdsp,
    process.env.CLIENT_ID,
    TEST_DEBITOR,
    process.env.SECRET
  )

  debitorGraphQLClient = new GraphQLClient(process.env.GRAPHQL_API, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: debitorToken
    }
  })

  await createAccount(
    cognitoIdsp,
    process.env.CLIENT_ID,
    TEST_CREDITOR,
    process.env.SECRET
  )
  let creditorToken = await getToken(
    cognitoIdsp,
    process.env.CLIENT_ID,
    TEST_CREDITOR,
    process.env.SECRET
  )

  creditorGraphQLClient = new GraphQLClient(process.env.GRAPHQL_API, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: creditorToken
    }
  })
})

let requests = [] // push requests created in each test, then teardown
afterEach(async () => {

  tearDownIntegrationTestDataInRDS(TEST_DEBITOR, TEST_CREDITOR)

  let transactionIDs = requests.map(i => i.transaction_id)
  let uniqueIDs = [ ...new Set(transactionIDs)]

  // delete test notifications added in dynamodb
  await tearDownNotifications(ddb, uniqueIDs, 6)
  requests = [] // reset after teardown
})

afterAll(async () => {
  await deleteAccount(
    cognitoIdsp,
    process.env.POOL_ID,
    TEST_CREDITOR
  )
  await deleteAccount(
    cognitoIdsp,
    process.env.POOL_ID,
    TEST_DEBITOR
  )
})

describe('graphql approve debit request', () => {
  it('debit approval values returned', async () => {
    // creditor creates debit request
    let createRequestResponse = await creditorGraphQLClient
      .request(createRequest, {
        items: debitRequest
      })
    // debitor approves debit request
    let approveRequestResponse = await debitorGraphQLClient
      .request(approveRequest, {
        items: createRequestResponse.createRequest
      })

    expect(approveRequestResponse.approveRequest)
      .toHaveLength(debitRequest.length)
    expect(approveRequestResponse.approveRequest[0].debitor)
      .toBe(debitRequest[0].debitor)
    expect(approveRequestResponse.approveRequest[0].creditor_approval_time)
      .toBeTruthy()

    requests.push(...createRequestResponse.createRequest) // teardown
  })
})
