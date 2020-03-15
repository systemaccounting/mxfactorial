const { SELECTORS, HISTORY_URL } = require('../../constants')

beforeAll(async () => {
  jest.setTimeout(30000)
  await page.goto(HISTORY_URL)
  await page.waitForSelector(SELECTORS.historyItemIndicator)
})

describe('historyScreen inventory', () => {
  it('contains currentAccountBalanceIndicator', async () => {
    const currentAccountBalanceIndicator = await page.$$eval(
      SELECTORS.currentAccountBalanceIndicator,
      list => list.length
    )
    expect(currentAccountBalanceIndicator).toEqual(1)
  })

  it('displays 20 most recent historyItemIndicator in descending time', async () => {
    const historyItemsLength = await page.$$eval(
      SELECTORS.historyItemIndicator,
      list => list.length
    )
    expect(historyItemsLength).toBeLessThanOrEqual(20)
  })
})
