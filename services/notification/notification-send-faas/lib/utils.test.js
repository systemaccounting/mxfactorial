const {
  dedupeAccounts,
} = require('./utils')

const {
  pendingNotifications,
  dedupedTestAccounts
} = require('../tests/utils/testData')

describe('utility functions', () => {
  test('dedupeAccounts', () => {
    let expected = dedupedTestAccounts
    let result = dedupeAccounts(pendingNotifications)
    expect(result).toEqual(expected)
  })
})