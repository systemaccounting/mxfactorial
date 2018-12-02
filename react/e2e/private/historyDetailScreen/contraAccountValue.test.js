const puppeteer = require('puppeteer')
const login = require('../../utils/login')

const { BASE_URL, HISTORY_URL } = require('../../constants')

const selectors = {
  historyItemIndicator: '[data-id="historyItemIndicator"]',
  transactionPartner: '[data-id="transactionPartner"]',
  contraAccountIndicator: '[data-id="contraAccountIndicator"]'
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
  await page.waitForSelector(selectors.historyItemIndicator)
})

afterAll(async () => {
  await browser.close()
})

describe('historyDetailScreen contraAccount value', () => {
  it('same contraAccountIndicator value on historyScreen and historyDetailScreen', async () => {
    const link = await page.$(selectors.historyItemIndicator)
    const partner1 = await page.$eval(`${selectors.historyItemIndicator} ${selectors.transactionPartner}`, elem => elem.textContent)
    link.click()
    await page.waitForSelector(selectors.contraAccountIndicator)
    const partner2 = await page.$eval(selectors.contraAccountIndicator, elem => elem.textContent)
    expect(partner1).toEqual(partner2)
  })
})
