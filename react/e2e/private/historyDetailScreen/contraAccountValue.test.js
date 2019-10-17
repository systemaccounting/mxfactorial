const { SELECTORS, HISTORY_URL } = require('../../constants')

beforeAll(async () => {
  await page.goto(HISTORY_URL)
  jest.setTimeout(30000)
  await page.waitForSelector(SELECTORS.historyItemIndicator)
})

describe('historyDetailScreen contraAccount value', () => {
  it('same contraAccountIndicator value on historyScreen and historyDetailScreen', async () => {
    const link = await page.$(SELECTORS.historyItemIndicator)
    const partner1 = await page.$eval(
      `${SELECTORS.historyItemIndicator} ${SELECTORS.transactionPartner}`,
      elem => elem.textContent
    )
    link.click()
    await page.waitForSelector(SELECTORS.contraAccountIndicator)
    const partner2 = await page.$eval(
      SELECTORS.contraAccountIndicator,
      elem => elem.textContent
    )
    expect(partner1).toEqual(partner2)
  })
})
