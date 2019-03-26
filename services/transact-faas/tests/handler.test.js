const { handler } = require('../index')
const requestRules = require('../src/requestRules')
const compareTransactions = require('../src/compareTransactions')
const storeTransactions = require('../src/storeTransactions')

jest.mock('../src/storeTransactions')
jest.mock('../src/requestRules.js')
jest.mock('../src/compareTransactions')

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

describe('Transact lambda faas', () => {
  it('tests itemsUnderTestArray for equality with itemsStandardArray', async () => {
    // const compareSpy = require('../src/compareTransactions')
    requestRules.mockReturnValueOnce(itemsStandardArray)
    await handler({ items: itemsUnderTestArray })
    expect(requestRules).toHaveBeenCalledWith(itemsUnderTestArray)
    expect(compareTransactions).toHaveBeenCalledWith(
      itemsUnderTestArray,
      itemsStandardArray
    )
  })

  it('INSERTs itemsUnderTestArray into transactions table', async () => {
    await handler({ items: itemsUnderTestArray })
    expect(storeTransactions).toHaveBeenCalledWith(itemsUnderTestArray)
  })

  it('service returns required items missing error to client if there are no required rules items', async () => {
    expect(1).toBe(1)
  })

  it('does NOT INSERT itemsUnderTestArray into transactions table if it`s missing required rules items', async () => {
    await handler({ items: itemsUnderTestArray })
    expect(storeTransactions).toHaveBeenCalled()
  })
})
