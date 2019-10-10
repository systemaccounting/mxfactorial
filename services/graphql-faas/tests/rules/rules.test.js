const { GraphQLClient } = require('graphql-request')
const { tearDownIntegrationTestDataInRDS } = require('../utils/tearDown')
const authenticate = require('../utils/authenticate')
const { REQUEST_URL } = require('../utils/baseUrl')
const { fetchRules } = require('../queries/rules')

let graphQLClient

beforeAll(async () => {
  const session = await authenticate('JoeSmith', 'password')
  const idToken = session.getIdToken().getJwtToken()

  graphQLClient = new GraphQLClient(REQUEST_URL, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: idToken
    }
  })
})

afterAll(() => {
  tearDownIntegrationTestDataInRDS()
})

const testItems = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2',
    author: 'Joe Smith',
    debitor: 'Joe Smith',
    creditor: 'Mary'
  }
]

jest.setTimeout(30000) // lambda and serverless aurora cold starts

describe('Function As A Service GraphQL Server /rules endpoint', () => {
  it('returns rules items', async done => {
    const { rules } = await graphQLClient.request(fetchRules, {
      transactions: testItems
    })
    const taxItem = rules.find(item => item.name === '9% state sales tax')
    expect(rules).toHaveLength(2)
    expect(taxItem.price).toBe('0.540')
    done()
  })
})
