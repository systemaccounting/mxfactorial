const AWS = require('aws-sdk')
const { GraphQLClient } = require('graphql-request')
const { createTransaction } = require('../queries/transactions')
const {
  TEST_ACCOUNT
} = require('./testData')

const {
  createAccount,
  deleteAccount,
  getToken
} = require('./integrationTestHelpers')

const cognitoIdsp = new AWS.CognitoIdentityServiceProvider({
  region: process.env.AWS_REGION
})

;(async () => {
  await createAccount(
    cognitoIdsp,
    process.env.CLIENT_ID,
    TEST_ACCOUNT,
    process.env.SECRET
  )
  let token = await getToken(
    cognitoIdsp,
    process.env.CLIENT_ID,
    TEST_ACCOUNT,
    process.env.SECRET
  )

  const graphQLClient = new GraphQLClient(process.env.GRAPHQL_API, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: token
    }
  })

  const warmUpRequest = (attempts = 20) =>
    graphQLClient.request(createTransaction, { items: [] }).catch(async res => {
      if (attempts === 0) {
        console.log(`\nLambda  not responding.`)
        return await deleteAccount(
          cognitoIdsp,
          process.env.POOL_ID,
          TEST_ACCOUNT
        )
      }
      process.stdout.write('.')
      warmUpRequest(attempts - 1)
    })

  console.log(`Warming up lambda ...`) // no ASI

  warmUpRequest().then(async res => {
    console.log(res)
    await deleteAccount(
      cognitoIdsp,
      process.env.POOL_ID,
      TEST_ACCOUNT
    )
  })

  process.stdout.write('\n')
})();
