const {
  goLambdaPromiseHandler,
  nodeLambdaPromiseHandler
} = require('./PromiseHandlers')

const {
  fakerAccountWithSevenRandomDigits,
  createRequestData
} = require('../../../tests/utils/testData')

// set test values in modules to avoid failure from
// teardown of shared values in unfinished parallel tests
const TEST_DEBITOR = fakerAccountWithSevenRandomDigits()
const TEST_CREDITOR = fakerAccountWithSevenRandomDigits()
const debitRequest = createRequestData(
  TEST_DEBITOR,
  TEST_CREDITOR,
  'debit'
)

describe('resolvers and handlers', () => {
  it('goLambdaPromiseHandler calls JSON.parse twice', async () => {
    const data = { Payload: JSON.stringify(JSON.stringify(debitRequest)) }
    const mockPromise = new Promise(resolve => resolve(data))
    const spy = jest.spyOn(JSON, 'parse')
      .mockImplementationOnce(() => JSON.stringify(debitRequest))
      .mockReturnValue(debitRequest)
    await goLambdaPromiseHandler(mockPromise)
    expect(spy.mock.calls[0][0]).toEqual(data.Payload)
    expect(spy.mock.calls[1][0]).toEqual(debitRequest)
    spy.mockRestore()
  })

  it('goLambdaPromiseHandler returns javascript object', async () => {
    const data = { Payload: JSON.stringify(JSON.stringify(debitRequest)) }
    const mockPromise = new Promise(resolve => resolve(data))
    const result = await goLambdaPromiseHandler(mockPromise)
    expect(result).toEqual(debitRequest)
  })

  it('goLambdaPromiseHandler returns error', async () => {
    const mockPromise = new Promise((res, rej) => rej(Error('error')))
    const result = await goLambdaPromiseHandler(mockPromise)
    expect(result.message).toBe('error')
  })

  it('nodeLambdaPromiseHandler calls JSON.parse', async () => {
    const data = JSON.stringify({ data: debitRequest })
    const payload = { Payload: data }
    const mockPromise = new Promise(resolve => resolve(payload))
    const spy = jest.spyOn(JSON, 'parse')
      .mockReturnValue(debitRequest)
    await nodeLambdaPromiseHandler(mockPromise)
    expect(spy).toHaveBeenCalledWith(data)
    spy.mockRestore()
  })

  it('nodeLambdaPromiseHandler returns javascript object', async () => {
    const data = JSON.stringify({ data: debitRequest })
    const payload = { Payload: data }
    const mockPromise = new Promise(resolve => resolve(payload))
    const result = await nodeLambdaPromiseHandler(mockPromise)
    expect(result).toEqual(debitRequest)
  })

  it('nodeLambdaPromiseHandler returns error', async () => {
    const mockPromise = new Promise((res, rej) => rej(Error('error')))
    const result = await nodeLambdaPromiseHandler(mockPromise)
    expect(result.message).toBe('error')
  })
})