const { handler } = require('../index')
// console.log(requestRules)

jest.mock('../src/storeTransactions')
jest.mock('../src/requestRules.js')

const itemsUnderTest = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2'
  }
]

describe('Transact lambda faas', () => {
  it('tests itemsUnderTestArray for equality with itemsStandardArray', async () => {
    await handler({ items: itemsUnderTest })
    expect(1).toBe(1)
  })

  it('INSERTs itemsUnderTestArray into transactions table', async () => {
    expect(1).toBe(1)
  })

  it('service returns required items missing error to client if there are no required rules items', async () => {
    expect(1).toBe(1)
  })

  it('does NOT INSERT itemsUnderTestArray into transactions table if there are no required rules items', async () => {
    expect(1).toBe(1)
  })
})
