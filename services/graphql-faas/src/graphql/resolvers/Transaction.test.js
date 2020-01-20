const {
  GetTransactionsByIDResolver,
  GetTransactionsByAccountResolver
} = require('./Transaction')

const testqueryidlambdaarn = 'testqueryidlambdaarn'
const testqueryaccountlambdaarn = 'testqueryaccountlambdaarn'
process.env.TRANSACTION_QUERY_BY_TRANSACTION_ID_LAMBDA_ARN = testqueryidlambdaarn
process.env.TRANSACTION_QUERY_BY_ACCOUNT_LAMBDA_ARN = testqueryaccountlambdaarn

beforeEach(() => {
  jest.clearAllMocks()
})

describe('transaction resolvers', () => {
  const mockLambdaService = {
    invoke: jest.fn(
      () => ({
        promise: () => ({})
      })
    )
  }
  const mockHandlerFn = jest.fn()

  it('calls GetTransactionsByIDResolver invoke with params', () => {
    const testargs = {
      account: 'testaccount',
      transactionID: 'transactionid',
    }
    const testgraphqlsender = 'testgraphqlsender'
    const expected = {
      FunctionName: testqueryidlambdaarn,
      Payload: JSON.stringify({
        transaction_id: testargs.transactionID,
        account: testargs.account,
        graphqlRequestSender: testgraphqlsender
      })
    }
    GetTransactionsByIDResolver(
      mockLambdaService,
      mockHandlerFn,
      testargs,
      testgraphqlsender
    )
    expect(mockLambdaService.invoke)
      .toHaveBeenCalledWith(expected)
  })

  it(
    'sets GetTransactionsByIDResolver account property with ' +
    'graphqlRequestSender value',
    () => {
    const testargs = {
      // account: 'testaccount',
      transactionID: 'transactionid',
    }
    const testgraphqlsender = 'testgraphqlsender'
    const expected = {
      FunctionName: testqueryidlambdaarn,
      Payload: JSON.stringify({
        transaction_id: testargs.transactionID,
        account: testgraphqlsender,
        graphqlRequestSender: testgraphqlsender
      })
    }
    GetTransactionsByIDResolver(
      mockLambdaService,
      mockHandlerFn,
      testargs,
      testgraphqlsender
    )
    expect(mockLambdaService.invoke)
      .toHaveBeenCalledWith(expected)
  })

  it('calls GetTransactionsByAccountResolver invoke with params', () => {
    const testargs = {
      account: 'testaccount',
    }
    const testgraphqlsender = 'testgraphqlsender'
    const expected = {
      FunctionName: testqueryaccountlambdaarn,
      Payload: JSON.stringify({
        account: testargs.account,
        graphqlRequestSender: testgraphqlsender
      })
    }
    GetTransactionsByAccountResolver(
      mockLambdaService,
      mockHandlerFn,
      testargs,
      testgraphqlsender
    )
    expect(mockLambdaService.invoke)
      .toHaveBeenCalledWith(expected)
  })

  it('sets GetTransactionsByAccountResolver account property with graphqlRequestSender value', () => {
    const testargs = {
      // account: 'testaccount',
    }
    const testgraphqlsender = 'testgraphqlsender'
    const expected = {
      FunctionName: testqueryaccountlambdaarn,
      Payload: JSON.stringify({
        account: testgraphqlsender,
        graphqlRequestSender: testgraphqlsender
      })
    }
    GetTransactionsByAccountResolver(
      mockLambdaService,
      mockHandlerFn,
      testargs,
      testgraphqlsender
    )
    expect(mockLambdaService.invoke)
      .toHaveBeenCalledWith(expected)
  })
})