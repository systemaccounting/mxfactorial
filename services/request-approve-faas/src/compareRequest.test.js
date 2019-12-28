const compareRequests = require('./compareRequest')
const {
  itemsUnderTestArray,
  itemsStandardArray,
} = require('../tests/utils/testData')

describe('compareRequest', () => {
  it('fails request ommitting rule-generated items', async () => {
    let result = compareRequests(
      itemsUnderTestArray,
      itemsStandardArray
    )
    expect(result).toBe(false)
  })

  it('passes request', async () => {
    let result = compareRequests(
      itemsStandardArray,
      itemsStandardArray
    )
    expect(result).toBe(true)
  })
})
