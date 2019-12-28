const compareRequests = require('./compareRequests')
const {
  itemsUnderTestArray,
  itemsStandardArray,
} = require('../tests/utils/testData')

describe('compareRequests', () => {
  it('fails requests ommitting rule-generated items', async () => {
    let result = compareRequests(
      itemsUnderTestArray,
      itemsStandardArray
    )
    expect(result).toBe(false)
  })

  it('passes requests', async () => {
    let result = compareRequests(
      itemsStandardArray,
      itemsStandardArray
    )
    expect(result).toBe(true)
  })
})
