const { GraphQLClient } = require('graphql-request')
const { fetchTransactions } = require('../queries/transactions')

const graphQLClient = new GraphQLClient(process.env.GRAPHQL_API, {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

describe('graphql auth', () => {
  it('returns 401 (Unauthorized) if requester not authenticated', async done => {
    try {
      await graphQLClient.request(fetchTransactions, {
        account: 'testaccount'
      })
    } catch (e) {
      expect(e.response.status).toBe(401)
      done()
    }
  })
})
