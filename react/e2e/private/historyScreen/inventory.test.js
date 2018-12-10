const { HISTORY_URL } = require('../../constants')

const selectors = {
  historyItemIndicator: '[data-id="historyItemIndicator"]',
  currentAccountBalanceIndicator: '[data-id="currentAccountBalanceIndicator"]'
}

beforeAll(async () => {
  await page.goto(HISTORY_URL)
  await page.waitForSelector(selectors.historyItemIndicator)
})

describe('historyScreen inventory', () => {
  it('contains currentAccountBalanceIndicator', async () => {
    const currentAccountBalanceIndicator = await page.$$eval(
      selectors.currentAccountBalanceIndicator,
      list => list.length
    )
    expect(currentAccountBalanceIndicator).toEqual(1)
  })
})
