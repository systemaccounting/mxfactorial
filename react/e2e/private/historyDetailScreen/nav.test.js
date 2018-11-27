const puppeteer = require('puppeteer')
const login = require('../../utils/login')

const { BASE_URL, HOME_URL, HISTORY_URL } = require('../../constants')

let browser
let page

const selectors = {
  backButton: '[data-id="backButton"]',
  homeButton: '[data-id="homeButton"]',
  homeScreen: '[data-id="homeScreen"]',
  historyScreen: '[data-id="historyScreen"]',
  historyItemIndicator: '[data-id="historyItemIndicator"]'
}

beforeAll(async () => {
  browser = await puppeteer.launch({
    args: ['--no-sandbox']
  })

  page = await browser.newPage()
  await page.goto(BASE_URL)
  page = await login(page)
  await page.goto(HISTORY_URL)
})

beforeEach(async () => {
  const link = await page.waitForSelector(selectors.historyItemIndicator)
  await link.click()
})

afterAll(async () => {
  await browser.close()
})

describe('historyDetailScreen navigation', () => {
  it('navigates to historyScreen on back button click', async () => {
    const backButton = await page.$(selectors.backButton)
    backButton.click()
    await page.waitForSelector(selectors.historyScreen)
    expect(page.url()).toEqual(HISTORY_URL)
  })

  it('navigates to homeScreen on home button click', async () => {
    const homeButton = await page.$(selectors.homeButton)
    homeButton.click()
    await page.waitForSelector(selectors.homeScreen)
    expect(page.url()).toEqual(HOME_URL)
  })
})
