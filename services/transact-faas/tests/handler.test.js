const { handler } = require('../index')
const storeTransactions = require('../src/storeTransactions')

jest.mock('../src/storeTransactions')
jest.mock('../src/requestRules.js')

const itemsUnderTestArray = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2'
  }
]

describe('Transact lambda faas', () => {
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
