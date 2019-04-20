const { handler } = require('../..')
const storeTransactions = require('../../src/storeTransactions')
const requestRules = require('../../src/requestRules')

jest.mock('../../src/storeTransactions')
jest.mock('../../src/requestRules.js')

const itemsUnderTestArray = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2',
    author: 'Joe Smith',
    debitor: 'Joe Smith',
    creditor: 'Mary'
  }
]

const itemsStandardArray = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2',
    author: 'Joe Smith',
    debitor: 'Joe Smith',
    creditor: 'Mary'
  },
  {
    name: '9% state sales tax',
    quantity: '1',
    price: '0.540',
    author: 'Joe Smith',
    debitor: 'Joe Smith',
    creditor: 'StateOfCalifornia'
  }
]

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
