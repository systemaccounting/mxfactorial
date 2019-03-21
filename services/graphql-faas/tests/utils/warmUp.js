const { GraphQLClient } = require('graphql-request')
const { REQUEST_URL } = require('./baseUrl')
const { createTransaction } = require('../queries/transactions')

const graphQLClient = new GraphQLClient(REQUEST_URL, {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

const warmUpRequest = (attempts = 20) =>
  graphQLClient.request(createTransaction, { items: [] }).catch(res => {
    console.log(res)
    if (attempts === 0) {
      console.log(`\nLambda and aurora serverless not responding.`)
      return
    }
    process.stdout.write('.')
    warmUpRequest(attempts - 1)
  })

console.log(`Warming up lambda and aurora serverless...`) // no ASI
warmUpRequest().then(res => console.log(res))

process.stdout.write('\n')
