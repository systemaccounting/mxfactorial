const {
  CreateRequestResolver,
  GetRequestByTransactionIDResolver,
  GetRequestByAccountResolver,
  ApproveRequestResolver
} = require('./Request')

const {
  fakerAccountWithSevenRandomDigits,
  createRequestData
} = require('../../../tests/utils/testData')

const testcreatelambda = 'testcreatelambda'
process.env.REQUEST_CREATE_LAMBDA_ARN = testcreatelambda
const testquerybyidlambdaarn = 'testquerybyidlambdaarn'
process
  .env.REQUEST_QUERY_BY_TRANSACTION_ID_LAMBDA_ARN = testquerybyidlambdaarn
const testquerybyaccountlambdaarn = 'testquerybyaccountlambdaarn'
process
  .env.REQUEST_QUERY_BY_ACCOUNT_LAMBDA_ARN = testquerybyaccountlambdaarn
const testapprovelambda = 'testapprovelambda'
process.env.REQUEST_APPROVE_LAMBDA_ARN = testapprovelambda


// set test values in modules to avoid failure from
// teardown of shared values in unfinished parallel tests
const TEST_DEBITOR = fakerAccountWithSevenRandomDigits()
const TEST_CREDITOR = fakerAccountWithSevenRandomDigits()
const debitRequest = createRequestData(
  TEST_DEBITOR,
  TEST_CREDITOR,
  'debit'
)

beforeEach(() => {
  jest.clearAllMocks()
})

describe('Request resolvers', () => {

  const mockLambdaService = {
    invoke: jest.fn(
      () => ({
        promise: () => ({})
      })
    )
  }
  const mockHandlerFn = jest.fn()

  it('CreateRequestResolver service called with args', () => {
    const mockHandlerFn = jest.fn()
    const testargs = { items: debitRequest }
    const testgraphqlsender = 'testgraphqlsender'
    const expected = {
      FunctionName: testcreatelambda,
      Payload: JSON.stringify({
        items: debitRequest,
        graphqlRequestSender: testgraphqlsender
      })
    }
    CreateRequestResolver(
      mockLambdaService,
      mockHandlerFn,
      testargs,
      testgraphqlsender
    )
    expect(mockLambdaService.invoke)
      .toHaveBeenCalledWith(expected)
  })

  it('CreateRequestResolver calls service handler with args', () => {
    const testargs = { items: debitRequest }
    const testgraphqlsender = 'testgraphqlsender'
    CreateRequestResolver(
      mockLambdaService,
      mockHandlerFn,
      testargs,
      testgraphqlsender
    )
    expect(mockHandlerFn)
      .toHaveBeenCalledWith({})
  })

  it(
    'CreateRequestResolver returns "please specify at least 1 transaction"',
     async () => {
      const testargs = {}
      const testgraphqlsender = 'testgraphqlsender'
      const result = await CreateRequestResolver(
        mockLambdaService,
        mockHandlerFn,
        testargs,
        testgraphqlsender
      )
      expect(result).toBe('please specify at least 1 transaction')
  })

  it('GetRequestByTransactionIDResolver calls service with args', () => {
    const testaccount = 'testaccount'
    const testransactionid = 'testtransactionid'
    const testargs = {
      transactionID: testransactionid,
      account: testaccount,
      items: debitRequest
    }
    const testgraphqlsender = 'testgraphqlsender'
    const expected = {
      FunctionName: testquerybyidlambdaarn,
      Payload: JSON.stringify({
        transaction_id: testargs.transactionID,
        account: testargs.account,
        graphqlRequestSender: testgraphqlsender
      })
    }
    GetRequestByTransactionIDResolver(
      mockLambdaService,
      mockHandlerFn,
      testargs,
      testgraphqlsender
    )
    expect(mockLambdaService.invoke)
      .toHaveBeenCalledWith(expected)
  })

  it('GetRequestByTransactionIDResolver calls service handler with args', () => {
    const testargs = { items: debitRequest }
    const testgraphqlsender = 'testgraphqlsender'
    GetRequestByTransactionIDResolver(
      mockLambdaService,
      mockHandlerFn,
      testargs,
      testgraphqlsender
    )
    expect(mockHandlerFn)
      .toHaveBeenCalledWith({})
  })

  it(
    'GetRequestByTransactionIDResolver sets account ' +
    'property with graphqlRequestSender value',
    () => {
      const testransactionid = 'testtransactionid'
      const testargs = {
        transactionID: testransactionid,
        // account: testaccount,
        items: debitRequest
      }
    const testgraphqlsender = 'testgraphqlsender'
    const expected = {
      FunctionName: testquerybyidlambdaarn,
      Payload: JSON.stringify({
        transaction_id: testargs.transactionID,
        account: testgraphqlsender,
        graphqlRequestSender: testgraphqlsender
      })
    }
    GetRequestByTransactionIDResolver(
      mockLambdaService,
      mockHandlerFn,
      testargs,
      testgraphqlsender
    )
    expect(mockLambdaService.invoke)
      .toHaveBeenCalledWith(expected)
  })

  it('GetRequestByAccountResolver calls service with args', () => {
    const testaccount = 'testaccount'
    const testransactionid = 'testtransactionid'
    const testargs = {
      transactionID: testransactionid,
      account: testaccount,
      items: debitRequest
    }
    const testgraphqlsender = 'testgraphqlsender'
    const expected = {
      FunctionName: testquerybyaccountlambdaarn,
      Payload: JSON.stringify({
        account: testargs.account,
        graphqlRequestSender: testgraphqlsender
      })
    }
    GetRequestByAccountResolver(
      mockLambdaService,
      mockHandlerFn,
      testargs,
      testgraphqlsender
    )
    expect(mockLambdaService.invoke)
      .toHaveBeenCalledWith(expected)
  })

  it('GetRequestByAccountResolver calls service handler with args', () => {
    const testargs = { items: debitRequest }
    const testgraphqlsender = 'testgraphqlsender'
    GetRequestByAccountResolver(
      mockLambdaService,
      mockHandlerFn,
      testargs,
      testgraphqlsender
    )
    expect(mockHandlerFn)
      .toHaveBeenCalledWith({})
  })

  it(
    'GetRequestByAccountResolver sets account property with graphqlRequestSender value',
    () => {
      const testransactionid = 'testtransactionid'
      const testargs = {
        // account: testaccount,
        items: debitRequest
      }
    const testgraphqlsender = 'testgraphqlsender'
    const expected = {
      FunctionName: testquerybyaccountlambdaarn,
      Payload: JSON.stringify({
        transaction_id: testargs.transactionID,
        account: testgraphqlsender,
        graphqlRequestSender: testgraphqlsender
      })
    }
    GetRequestByAccountResolver(
      mockLambdaService,
      mockHandlerFn,
      testargs,
      testgraphqlsender
    )
    expect(mockLambdaService.invoke)
      .toHaveBeenCalledWith(expected)
  })

  it('ApproveRequestResolver service called with args', () => {
    const mockHandlerFn = jest.fn()
    const testargs = { items: debitRequest }
    const testgraphqlsender = 'testgraphqlsender'
    const expected = {
      FunctionName: testapprovelambda,
      Payload: JSON.stringify({
        items: debitRequest,
        graphqlRequestSender: testgraphqlsender
      })
    }
    ApproveRequestResolver(
      mockLambdaService,
      mockHandlerFn,
      testargs,
      testgraphqlsender
    )
    expect(mockLambdaService.invoke)
      .toHaveBeenCalledWith(expected)
  })

  it('ApproveRequestResolver calls service handler with args', () => {
    const testargs = { items: debitRequest }
    const testgraphqlsender = 'testgraphqlsender'
    ApproveRequestResolver(
      mockLambdaService,
      mockHandlerFn,
      testargs,
      testgraphqlsender
    )
    expect(mockHandlerFn)
      .toHaveBeenCalledWith({})
  })

  it(
    'ApproveRequestResolver returns "please specify at least 1 transaction"',
     async () => {
      const testargs = {}
      const testgraphqlsender = 'testgraphqlsender'
      const result = await ApproveRequestResolver(
        mockLambdaService,
        mockHandlerFn,
        testargs,
        testgraphqlsender
      )
      expect(result).toBe('please specify at least 1 request')
  })
})