const { HISTORY_URL } = require('../../constants')

const selectors = {
  historyItemIndicator: '[data-id="historyItemIndicator"]',
  transactionPartner: '[data-id="transactionPartner"]',
  contraAccountIndicator: '[data-id="contraAccountIndicator"]'
}

beforeAll(async () => {
  await page.goto(HISTORY_URL)
  await page.waitForSelector(selectors.historyItemIndicator)
})

describe('historyDetailScreen contraAccount value', () => {
  it('same contraAccountIndicator value on historyScreen and historyDetailScreen', async () => {
    const link = await page.$(selectors.historyItemIndicator)
    const partner1 = await page.$eval(
      `${selectors.historyItemIndicator} ${selectors.transactionPartner}`,
      elem => elem.textContent
    )
    link.click()
    await page.waitForSelector(selectors.contraAccountIndicator)
    const partner2 = await page.$eval(
      selectors.contraAccountIndicator,
      elem => elem.textContent
    )
    expect(partner1).toEqual(partner2)
  })
})
