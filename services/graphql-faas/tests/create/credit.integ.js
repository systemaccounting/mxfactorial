const AWS = require('aws-sdk')
const { GraphQLClient } = require('graphql-request')
const { tearDownIntegrationTestDataInRDS } = require('../utils/tearDown')
const {
  createRequest,
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
const creditRequest = createRequestData(
  TEST_DEBITOR,
  TEST_CREDITOR,
  'credit'
)


let graphQLClient
beforeAll(async () => {
  jest.setTimeout(30000) // lambda cold start
  await createAccount(
    cognitoIdsp,
    process.env.CLIENT_ID,
    TEST_DEBITOR,
    process.env.SECRET
  )
  let token = await getToken(
    cognitoIdsp,
    process.env.CLIENT_ID,
    TEST_DEBITOR,
    process.env.SECRET
  )

  graphQLClient = new GraphQLClient(process.env.GRAPHQL_API, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: token
    }
  })
})

let requests = [] // push requests created in each test, then teardown
afterEach(async () => {

  tearDownIntegrationTestDataInRDS(TEST_DEBITOR, TEST_CREDITOR)

  let transactionIDs = requests.map(i => i.transaction_id)
  let uniqueIDs = [ ...new Set(transactionIDs)]

  // delete test notifications added in dynamodb
  await tearDownNotifications(ddb, uniqueIDs, 3)
  requests = [] // reset after teardown
})

afterAll(async () => {
  await deleteAccount(
    cognitoIdsp,
    process.env.POOL_ID,
    TEST_DEBITOR
  )
})

describe('graphql create credit request', () => {
  it('create credit request values returned', async () => {
    let response = await graphQLClient.request(createRequest, {
      items: creditRequest
    })

    expect(response.createRequest).toHaveLength(creditRequest.length)
    expect(response.createRequest[0].creditor)
      .toBe(creditRequest[0].creditor)
    expect(response.createRequest[0].debitor_approval_time)
      .toBeTruthy()

    requests.push(...response.createRequest) // teardown
  })
})
