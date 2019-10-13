const { handler } = require('../..')
const storeTransactions = require('../../src/storeTransactions')
const requestRules = require('../../src/requestRules')
const {
  itemsUnderTestArray,
  itemsStandardArray
} = require('../utils/testData')

jest.mock('../../src/storeTransactions')
jest.mock('../../src/compareTransactions', () => {
  return jest.fn()
    .mockReturnValueOnce(true)
    .mockReturnValueOnce(false)
    .mockReturnValue(true)
})
jest.mock('../../src/requestRules.js', () => jest.fn().mockImplementation(() => {
  return jest.requireActual('../utils/testData').itemsStandardArray
}))
jest.mock('uuid/v1', () => jest.fn().mockReturnValue('662bc1a0-ed24-11e9-90ac-fd8810fc35b7'))

describe('Store into transactions table', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('INSERTs itemsUnderTestArray into transactions table', async () => {
    await handler({ items: itemsUnderTestArray })
    expect(storeTransactions).toHaveBeenCalledWith(itemsUnderTestArray)
  })

  it('service returns `Required items missing` error to client if there are no required rules items', async () => {
    requestRules.mockReturnValueOnce(itemsStandardArray)
    const response = await handler({ items: itemsUnderTestArray })
    expect(response.message).toBe('Required items missing')
    expect(storeTransactions).not.toHaveBeenCalled()
  })

  it('ignores debitor_approval_time and creditor_approval_time sent from client', async () => {
    const items = itemsUnderTestArray.map(item => ({
      ...item,
      debitor_approval_time: '2019-12-12',
      creditor_approval_time: '2019-12-12'
    }))
    await handler({ items })
    expect(storeTransactions).toHaveBeenCalledWith(itemsUnderTestArray)
  })
})
