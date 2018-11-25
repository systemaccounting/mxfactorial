const puppeteer = require('puppeteer')
const login = require('../../utils/login')

const { BASE_URL, HISTORY_URL } = require('../../constants')

const selectors = {
  backButton: '[data-id="backButton"]',
  emailCopyButton: '[data-id="emailCopyButton"]',
  contraAccountIndicator: '[data-id="contraAccountIndicator"]',
  sumTransactionItemValueIndicator:
    '[data-id="sumTransactionItemValueIndicator"]'
}

let browser
let page

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
})
