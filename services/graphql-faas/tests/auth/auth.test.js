const { GraphQLClient } = require('graphql-request')
const { REQUEST_URL } = require('../utils/baseUrl')
const { fetchTransactions } = require('../queries/transactions')

const graphQLClient = new GraphQLClient(REQUEST_URL, {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

describe('Function As A Service GraphQL Server authentication', () => {
  it('returns 401 (Unauthorized) if user is not authenticated', async done => {
    try {
      await graphQLClient.request(fetchTransactions, {
        user: 'JoeSmith'
      })
    } catch (e) {
      expect(e.response.status).toBe(401)
      done()
    }
  })
})
