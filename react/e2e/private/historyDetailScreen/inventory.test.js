const { SELECTORS, HISTORY_URL } = require('../../constants')

// prior art: https://stackoverflow.com/questions/354044/what-is-the-best-u-s-currency-regex
const balanceRegex = /^\$?-?\s?([1-9]{1}[0-9]{0,2}(,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))$|^-?\$?([1-9]{1}\d{0,2}(,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))$|^\(\$?([1-9]{1}\d{0,2}(,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))\)$/

describe('historyDetailScreen inventory', () => {
  beforeAll(async () => {
    jest.setTimeout(30000)
    await page.goto(HISTORY_URL)
    const link = await page.waitForSelector('[data-id="historyItemIndicator"]')
    await link.click()
  })

  it('displays back button', async () => {
    const backButton = await page.$$eval(
      SELECTORS.backButton,
      list => list.length
    )
    expect(backButton).toEqual(1)
  })

  it('displays email copy button', async () => {
    const emailCopyButton = await page.$$eval(
      SELECTORS.emailCopyButton,
      list => list.length
    )
    expect(emailCopyButton).toEqual(1)
  })

  it('displays contraAccountIndicator', async () => {
    await page.waitForSelector(SELECTORS.contraAccountIndicator)
    const contraAccountIndicator = await page.$$eval(
      SELECTORS.contraAccountIndicator,
      list => list.length
    )
    expect(contraAccountIndicator).toEqual(1)
  })

  it('displays sumTransactionItemValueIndicator', async () => {
    const sumTransactionItemValueIndicator = await page.$$eval(
      SELECTORS.sumTransactionItemValueIndicator,
      list => list.length
    )
    expect(sumTransactionItemValueIndicator).toEqual(1)
  })

  it('displays transactionTimeIndicator', async () => {
    const transactionTimeIndicator = await page.$$eval(
      SELECTORS.transactionTimeIndicator,
      list => list.length
    )
    expect(transactionTimeIndicator).toEqual(1)
  })

  it('contains transactionItemIndicator', async () => {
    const transactionItemIndicator = await page.$$eval(
      SELECTORS.transactionItemIndicator,
      list => list.length
    )
    expect(transactionItemIndicator).toBeGreaterThanOrEqual(1)
  })

  it('contains transactionIdIndicator', async () => {
    const transactionIdIndicator = await page.$$eval(
      SELECTORS.transactionIdIndicator,
      list => list.length
    )
    expect(transactionIdIndicator).toEqual(1)
  })

  it('contains ruleInstanceIdsIndicator', async () => {
    const ruleInstanceIdsIndicator = await page.$$eval(
      SELECTORS.ruleInstanceIdsIndicator,
      list => list.length
    )
    expect(ruleInstanceIdsIndicator).toEqual(1)
  })

  it('contains preTransactionBalanceIndicator', async () => {
    const preTransactionBalanceIndicator = await page.$$eval(
      SELECTORS.preTransactionBalanceIndicator,
      list => list.length
    )
    expect(preTransactionBalanceIndicator).toEqual(1)
  })

  it('contains postTransactionBalanceIndicator', async () => {
    const postTransactionBalanceIndicator = await page.$$eval(
      SELECTORS.postTransactionBalanceIndicator,
      list => list.length
    )
    expect(postTransactionBalanceIndicator).toEqual(1)
  })

  it('contains disputeTransactionButton', async () => {
    const disputeTransactionButton = await page.$$eval(
      SELECTORS.disputeTransactionButton,
      list => list.length
    )
    expect(disputeTransactionButton).toEqual(1)
  })

  it('preTransactionBalanceIndicator displays commas and decimals', async () => {
    const element = await page.$(SELECTORS.preTransactionBalanceIndicator)
    const preTransactionBalance = await page.evaluate(
      element => element.textContent,
      element
    )
    expect(preTransactionBalance).toMatch(balanceRegex)
  })

  it('postTransactionBalanceIndicator displays commas and decimals', async () => {
    const element = await page.$(SELECTORS.postTransactionBalanceIndicator)
    const postTransactionBalance = await page.evaluate(
      element => element.textContent,
      element
    )
    expect(postTransactionBalance).toMatch(balanceRegex)
  })
})
