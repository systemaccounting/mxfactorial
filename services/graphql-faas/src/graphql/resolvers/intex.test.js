const AWS = require('aws-sdk')

const {
  CreateRequestResolver,
  GetRequestResolver,
  ApproveRequestResolver
} = require('./Request')

const GetTransactionsResolver = require('./Transaction')

const {
  getRules,
  queryTable,
  GetRuleTransactionsResolver,
  GetRuleInstanceResolver
} = require('./Rule')

const {
  goLambdaPromiseHandler,
  nodeLambdaPromiseHandler
} = require('./PromiseHandlers')

jest.mock('aws-sdk', () => ({
  DynamoDB: {
    DocumentClient: jest.fn(() => ({}))
  },
  Lambda: jest.fn(() => ({}))
}))

jest.mock('./Request')
jest.mock('./Transaction')
jest.mock('./Rule')
jest.mock('./PromiseHandlers')

describe('resolvers and handlers', () => {
  test('calls DocumentClient with config', async () => {
    require('./index')
    const expected = {
      region: process.env.AWS_REGION
    }
    expect(AWS.DynamoDB.DocumentClient)
      .toHaveBeenCalledWith(expected)
  })

  test('calls Lambda', async () => {
    require('./index')
    expect(AWS.Lambda).toHaveBeenCalled()
  })

  it('index module exports Query object', () => {
    const index = require('./index')
    const inventory = Object.keys(index)
      .filter(item => item === 'Query')
    expect(inventory).toHaveLength(1)
  })

  it('index module exports Mutation object', () => {
    const index = require('./index')
    const inventory = Object.keys(index)
      .filter(item => item === 'Mutation')
    expect(inventory).toHaveLength(1)
  })

  it('index module exports Query resolvers', () => {
    const index = require('./index')
    const inventory = Object.keys(index.Query)
    expect(inventory.filter(item => item === 'transactionsByID'))
      .toHaveLength(1)
    expect(inventory.filter(item => item === 'transactionsByAccount'))
      .toHaveLength(1)
    expect(inventory.filter(item => item === 'requestsByID'))
      .toHaveLength(1)
    expect(inventory.filter(item => item === 'requestsByAccount'))
      .toHaveLength(1)
    expect(inventory.filter(item => item === 'rules'))
      .toHaveLength(1)
    expect(inventory.filter(item => item === 'ruleInstances'))
      .toHaveLength(1)
  })

  it('index module exports Mutation resolvers', () => {
    const index = require('./index')
    const inventory = Object.keys(index.Mutation)
    expect(inventory.filter(item => item === 'createRequest'))
      .toHaveLength(1)
    expect(inventory.filter(item => item === 'approveRequest'))
      .toHaveLength(1)
  })

  it('GetTransactionsResolver called by transactionsByID', () => {
    const transactionsByID = require('./index').Query.transactionsByID
    const testlambda = {}
    const testsender = 'testsender'
    const testargs = {}
    const testctx = { graphqlRequestSender: testsender }
    transactionsByID(null, testargs, testctx)
    expect(GetTransactionsResolver).toHaveBeenCalledWith(
      testlambda,
      goLambdaPromiseHandler,
      testargs,
      testsender
    )
  })

  it('GetTransactionsResolver called by transactionsByAccount', () => {
    const transactionsByAccount = require('./index').Query.transactionsByAccount
    const testlambda = {}
    const testsender = 'testsender'
    const testargs = {}
    const testctx = { graphqlRequestSender: testsender }
    transactionsByAccount(null, testargs, testctx)
    expect(GetTransactionsResolver).toHaveBeenCalledWith(
      testlambda,
      goLambdaPromiseHandler,
      testargs,
      testsender
    )
  })

  it('GetRequestResolver called by requestsByAccount', () => {
    const requestsByAccount = require('./index').Query.requestsByAccount
    const testlambda = {}
    const testsender = 'testsender'
    const testargs = {}
    const testctx = { graphqlRequestSender: testsender }
    requestsByAccount(null, testargs, testctx)
    expect(GetRequestResolver).toHaveBeenCalledWith(
      testlambda,
      goLambdaPromiseHandler,
      testargs,
      testsender
    )
  })

  it('GetRuleTransactionsResolver called by rules', () => {
    const rules = require('./index').Query.rules
    const testlambda = {}
    const testargs = {}
    rules(testlambda, testargs)
    expect(GetRuleTransactionsResolver).toHaveBeenCalledWith(
      testlambda,
      testargs
    )
  })

  it('GetRuleInstanceResolver called by ruleInstances', () => {
    const ruleInstances = require('./index').Query.ruleInstances
    const testddb = {}
    const testargs = { keySchema: ['name:'] }
    ruleInstances(testddb, testargs)
    expect(GetRuleInstanceResolver).toHaveBeenCalledWith(
      testddb,
      testargs.keySchema,
      getRules,
      queryTable
    )
  })

  it('CreateRequestResolver called by createRequest', () => {
    const createRequest = require('./index').Mutation.createRequest
    const testlambda = {}
    const testsender = 'testsender'
    const testargs = {}
    const testctx = { graphqlRequestSender: testsender }
    createRequest(null, testargs, testctx)
    expect(CreateRequestResolver).toHaveBeenCalledWith(
      testlambda,
      nodeLambdaPromiseHandler,
      testargs,
      testsender
    )
  })

  it('ApproveRequestResolver called by approveRequest', () => {
    const approveRequest = require('./index').Mutation.approveRequest
    const testlambda = {}
    const testsender = 'testsender'
    const testargs = {}
    const testctx = { graphqlRequestSender: testsender }
    approveRequest(null, testargs, testctx)
    expect(ApproveRequestResolver).toHaveBeenCalledWith(
      testlambda,
      nodeLambdaPromiseHandler,
      testargs,
      testsender
    )
  })
})