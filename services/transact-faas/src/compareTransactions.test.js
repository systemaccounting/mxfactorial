const compareTransactions = require('./compareTransactions')
const {
  itemsUnderTestArray,
  itemsStandardArray,
} = require('../tests/utils/testData')

describe('compareTransactions', () => {
  it('fails transactions ommitting rule-generated items', async () => {
    let result = compareTransactions(
      itemsUnderTestArray,
      itemsStandardArray
    )
    expect(result).toBe(false)
  })

  it('passes transactions', async () => {
    let result = compareTransactions(
      itemsStandardArray,
      itemsStandardArray
    )
    expect(result).toBe(true)
  })
})
