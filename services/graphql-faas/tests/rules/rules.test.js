const { GraphQLClient } = require('graphql-request')
const { tearDownIntegrationTestDataInRDS } = require('../utils/tearDown')
const { REQUEST_URL } = require('../utils/baseUrl')
const { fetchRules } = require('../queries/rules')

const graphQLClient = new GraphQLClient(REQUEST_URL, {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

afterAll(() => {
  tearDownIntegrationTestDataInRDS()
})

const testItems = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2',
    author: 'Joe Smith'
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
