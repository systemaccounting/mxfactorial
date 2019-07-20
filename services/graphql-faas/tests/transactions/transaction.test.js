const { GraphQLClient } = require('graphql-request')
const { tearDownIntegrationTestDataInRDS } = require('../utils/tearDown')
const authenticate = require('../utils/authenticate')
const { REQUEST_URL } = require('../utils/baseUrl')
const {
  createTransaction,
  fetchTransactions
} = require('../queries/transactions')

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

const debitRequest = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2',
    author: 'Joe Smith',
    debitor: 'Joe Smith',
    creditor: 'Mary'
  },
  {
    name: '9% state sales tax',
    price: '0.540',
    quantity: '1',
    author: 'Joe Smith',
    debitor: 'Joe Smith',
    creditor: 'StateOfCalifornia'
  }
]

const creditRequest = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2',
    author: 'Joe Smith',
    creditor: 'Joe Smith',
    debitor: 'Mary'
  },
  {
    name: '9% state sales tax',
    price: '0.540',
    quantity: '1',
    author: 'Joe Smith',
    debitor: 'Mary',
    creditor: 'StateOfCalifornia'
  }
]

jest.setTimeout(30000) // lambda and serverless aurora cold starts

describe('Function As A Service GraphQL Server /transact endpoint', () => {
  it('sends transaction mutation', async done => {
    const response = await graphQLClient.request(createTransaction, {
      items: debitRequest
    })
    expect(response.createTransaction).toHaveLength(debitRequest.length)
    done()
  })

  it('sets debitor_approval_time if author === debitor', async done => {
    const response = await graphQLClient.request(createTransaction, {
      items: debitRequest
    })
    response.createTransaction.forEach(item => {
      if (item.author === item.debitor) {
        expect(item.creditor_approval_time).toBeNull()
        expect(item.debitor_approval_time).not.toBeNull()
      }
    })
    done()
  })

  it('sets creditor_approval_time if author === creditor', async done => {
    const response = await graphQLClient.request(createTransaction, {
      items: creditRequest
    })
    response.createTransaction.forEach(item => {
      if (item.author === item.creditor) {
        expect(item.creditor_approval_time).not.toBeNull()
        expect(item.debitor_approval_time).toBeNull()
      }
    })
    done()
  })

  it('returns 20 most recent debit and credit requests matching authenticated account', async done => {
    const response = await graphQLClient.request(fetchTransactions, {
      user: 'JoeSmith'
    })
    response.transactions.forEach(item => {
      expect(item.debitor || item.creditor).toBe('JoeSmith')
    })
    done()
  })
})
