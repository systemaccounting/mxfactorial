const GetTransactionsResolver = require('./Transaction')

const testlambdaarn = 'testlambdaarn'
process.env.TRANSACTION_QUERY_LAMBDA_ARN = testlambdaarn

beforeEach(() => {
  jest.clearAllMocks()
})

describe('GetTransactionsResolver', () => {
  const mockLambdaService = {
    invoke: jest.fn(
      () => ({
        promise: () => ({})
      })
    )
  }
  const mockHandlerFn = jest.fn()

  it('calls invoke with params', () => {
    const testargs = {
      account: 'testaccount',
      transactionID: 'transactionid',
    }
    const testgraphqlsender = 'testgraphqlsender'
    const expected = {
      FunctionName: testlambdaarn,
      Payload: JSON.stringify({
        transaction_id: testargs.transactionID,
        account: testargs.account,
        graphqlRequestSender: testgraphqlsender
      })
    }
    GetTransactionsResolver(
      mockLambdaService,
      mockHandlerFn,
      testargs,
      testgraphqlsender
    )
    expect(mockLambdaService.invoke)
      .toHaveBeenCalledWith(expected)
  })

  it('sets account property with graphqlRequestSender value', () => {
    const testargs = {
      // account: 'testaccount',
      transactionID: 'transactionid',
    }
    const testgraphqlsender = 'testgraphqlsender'
    const expected = {
      FunctionName: testlambdaarn,
      Payload: JSON.stringify({
        transaction_id: testargs.transactionID,
        account: testgraphqlsender,
        graphqlRequestSender: testgraphqlsender
      })
    }
    GetTransactionsResolver(
      mockLambdaService,
      mockHandlerFn,
      testargs,
      testgraphqlsender
    )
    expect(mockLambdaService.invoke)
      .toHaveBeenCalledWith(expected)
  })
})