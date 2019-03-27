const { handler } = require('../../index')

const requestRules = require('../../src/requestRules')
const compareTransactions = require('../../src/compareTransactions')

jest.mock('../../src/storeTransactions')
jest.mock('../../src/requestRules.js')
jest.mock('../../src/compareTransactions')

const itemsUnderTestArray = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2'
  }
]

const itemsStandardArray = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2'
  },
  {
    name: '9% state sales tax',
    quantity: '1',
    price: '0.540'
  }
]

describe('/transact service tests transactions items against /rules', () => {
  it('tests itemsUnderTestArray for equality with itemsStandardArray', async () => {
    requestRules.mockReturnValueOnce(itemsStandardArray)
    await handler({ items: itemsUnderTestArray })
    expect(requestRules).toHaveBeenCalledWith(itemsUnderTestArray)
    expect(compareTransactions).toHaveBeenCalledWith(
      itemsUnderTestArray,
      itemsStandardArray
    )
  })
})
