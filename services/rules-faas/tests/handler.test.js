const { handler } = require('../index')

const input = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2'
  }
]

describe('Rules labmda faas', () => {
  it('applies rules correctly', async () => {
    const response = await handler({ transactions: input })
    const ruleItem = response.find(item => item.name === '9% state sales tax')
    expect(ruleItem.price).toEqual('0.540')
    expect(ruleItem.creditor).toEqual('StateOfCalifornia')
  })
})
