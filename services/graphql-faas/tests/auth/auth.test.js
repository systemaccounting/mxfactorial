const { GraphQLClient } = require('graphql-request')
const { fetchTransactions } = require('../queries/transactions')

const graphQLClient = new GraphQLClient(process.env.GRAPHQL_API, {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

describe('Function As A Service GraphQL Server authentication', () => {
  it('returns 401 (Unauthorized) if user is not authenticated', async done => {
    try {
      await graphQLClient.request(fetchTransactions, {
        user: 'testaccount'
      })
    } catch (e) {
      expect(e.response.status).toBe(401)
      done()
    }
  })
})
