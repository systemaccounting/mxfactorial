const puppeteer = require('puppeteer')
const login = require('../../utils/login')

const { BASE_URL, HISTORY_URL } = require('../../constants')

const selectors = {
  backButton: '[data-id="backButton"]',
  emailCopyButton: '[data-id="emailCopyButton"]',
  contraAccountIndicator: '[data-id="contraAccountIndicator"]',
  sumTransactionItemValueIndicator:
    '[data-id="sumTransactionItemValueIndicator"]',
  transactionTimeIndicator: '[data-id="transactionTimeIndicator"]',
  transactionItemIndicator: '[data-id="transactionItemIndicator"]',
  transactionIdIndicator: '[data-id="transactionIdIndicator"]',
  ruleInstanceIdsIndicator: '[data-id="ruleInstanceIdsIndicator"]',
  preTransactionBalanceIndicator: '[data-id="preTransactionBalanceIndicator"]',
  postTransactionBalanceIndicator:
    '[data-id="postTransactionBalanceIndicator"]',
  disputeTransactionButton: '[data-id="disputeTransactionButton"]'
}

let browser
let page

// prior art: https://stackoverflow.com/questions/354044/what-is-the-best-u-s-currency-regex
const balanceRegex = /^\$?-?\s?([1-9]{1}[0-9]{0,2}(,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))$|^-?\$?([1-9]{1}\d{0,2}(,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))$|^\(\$?([1-9]{1}\d{0,2}(,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))\)$/

beforeAll(async () => {
  browser = await puppeteer.launch({
    args: ['--no-sandbox']
  })

  page = await browser.newPage()
  await page.goto(BASE_URL)
  page = await login(page)
  await page.goto(HISTORY_URL)
  const link = await page.waitForSelector('[data-id="historyItemIndicator"]')
  await link.click()
})

afterAll(async () => {
  await browser.close()
})

describe('historyDetailScreen inventory', () => {
  it('displays back button', async () => {
    const backButton = await page.$$eval(
      selectors.backButton,
      list => list.length
    )
    expect(backButton).toEqual(1)
  })

  it('displays email copy button', async () => {
    const emailCopyButton = await page.$$eval(
      selectors.emailCopyButton,
      list => list.length
    )
    expect(emailCopyButton).toEqual(1)
  })

  it('displays contraAccountIndicator', async () => {
    const contraAccountIndicator = await page.$$eval(
      selectors.contraAccountIndicator,
      list => list.length
    )
    expect(contraAccountIndicator).toEqual(1)
  })

  it('displays sumTransactionItemValueIndicator', async () => {
    const sumTransactionItemValueIndicator = await page.$$eval(
      selectors.sumTransactionItemValueIndicator,
      list => list.length
    )
    expect(sumTransactionItemValueIndicator).toEqual(1)
  })

  it('displays transactionTimeIndicator', async () => {
    const transactionTimeIndicator = await page.$$eval(
      selectors.transactionTimeIndicator,
      list => list.length
    )
    expect(transactionTimeIndicator).toEqual(1)
  })

  it('contains transactionItemIndicator', async () => {
    const transactionItemIndicator = await page.$$eval(
      selectors.transactionItemIndicator,
      list => list.length
    )
    expect(transactionItemIndicator).toEqual(1)
  })

  it('contains transactionIdIndicator', async () => {
    const transactionIdIndicator = await page.$$eval(
      selectors.transactionIdIndicator,
      list => list.length
    )
    expect(transactionIdIndicator).toEqual(1)
  })

  it('contains ruleInstanceIdsIndicator', async () => {
    const ruleInstanceIdsIndicator = await page.$$eval(
      selectors.ruleInstanceIdsIndicator,
      list => list.length
    )
    expect(ruleInstanceIdsIndicator).toEqual(1)
  })

  it('contains preTransactionBalanceIndicator', async () => {
    const preTransactionBalanceIndicator = await page.$$eval(
      selectors.preTransactionBalanceIndicator,
      list => list.length
    )
    expect(preTransactionBalanceIndicator).toEqual(1)
  })

  it('contains postTransactionBalanceIndicator', async () => {
    const postTransactionBalanceIndicator = await page.$$eval(
      selectors.postTransactionBalanceIndicator,
      list => list.length
    )
    expect(postTransactionBalanceIndicator).toEqual(1)
  })

  it('contains disputeTransactionButton', async () => {
    const disputeTransactionButton = await page.$$eval(
      selectors.disputeTransactionButton,
      list => list.length
    )
    expect(disputeTransactionButton).toEqual(1)
  })

  it('preTransactionBalanceIndicator displays commas and decimals', async () => {
    const element = await page.$(selectors.preTransactionBalanceIndicator)
    const preTransactionBalance = await page.evaluate(
      element => element.textContent,
      element
    )
    expect(preTransactionBalance).toMatch(balanceRegex)
  })

  it('postTransactionBalanceIndicator displays commas and decimals', async () => {
    const element = await page.$(selectors.postTransactionBalanceIndicator)
    const postTransactionBalance = await page.evaluate(
      element => element.textContent,
      element
    )
    expect(postTransactionBalance).toMatch(balanceRegex)
  })
})
