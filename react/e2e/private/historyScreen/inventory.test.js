const puppeteer = require('puppeteer')
const login = require('../../utils/login')

const { BASE_URL, HISTORY_URL } = require('../../constants')

const selectors = {
  currentAccountBalanceIndicator: '[data-id="currentAccountBalanceIndicator"]'
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
})

afterAll(async () => {
  await browser.close()
})

describe('historyScreen inventory', () => {
  it('contains currentAccountBalanceIndicator', async () => {
    const currentAccountBalanceIndicator = await page.$$eval(
      selectors.currentAccountBalanceIndicator,
      list => list.length
    )
    expect(preTransactionBalanceIndicator).toEqual(1)
  })
})
