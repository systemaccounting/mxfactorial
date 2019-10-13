const { handler } = require('../../index')
const requestRules = require('../../src/requestRules')
const axios = require('axios')
const compareTransactions = require('../../src/compareTransactions')

const {
  itemsUnderTestArray,
  itemsStandardArray,
  RULES_URL
} = require('../utils/testData')

jest.mock('axios')
jest.mock('../../src/storeTransactions')
jest.mock('../../src/requestRules.js', () => jest.fn().mockImplementation(() => {
  return jest.requireActual('../utils/testData').itemsStandardArray
}))
jest.mock('../../src/compareTransactions')
jest.mock('uuid/v1', () => jest.fn().mockReturnValue('662bc1a0-ed24-11e9-90ac-fd8810fc35b7'))

afterEach(() => {
  jest.clearAllMocks()
})

describe('/transact service tests transactions items against /rules', () => {
  it('tests itemsUnderTestArray for equality with itemsStandardArray', async () => {
    process.env.RULES_URL = RULES_URL
    // requestRules.mockReturnValueOnce(itemsStandardArray)
    await handler({ items: itemsUnderTestArray })
    expect(requestRules).toHaveBeenCalledWith(axios, RULES_URL, itemsUnderTestArray)
    expect(compareTransactions).toHaveBeenCalledWith(
      itemsUnderTestArray,
      itemsStandardArray
    )
  })
})
