const compareRequests = require('./compareRequests')
const {
  fakerAccountWithSevenRandomDigits,
  createRequestData
} = require('../tests/utils/testData')

// set test values in modules to avoid failure from
// teardown of shared values in unfinished parallel tests
const TEST_DEBITOR = fakerAccountWithSevenRandomDigits()
const TEST_CREDITOR = fakerAccountWithSevenRandomDigits()
const debitRequest = createRequestData(
  TEST_DEBITOR,
  TEST_CREDITOR,
  'debit'
)

const taxExcluded = [ debitRequest[0] ]


describe('compareRequests', () => {
  it('fails request ommitting rule-generated items', async () => {
    let result = compareRequests(
      taxExcluded,
      debitRequest
    )
    expect(result).toBe(false)
  })

  it('passes request', async () => {
    let result = compareRequests(
      debitRequest,
      debitRequest
    )
    expect(result).toBe(true)
  })
})
