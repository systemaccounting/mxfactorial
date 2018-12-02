const puppeteer = require('puppeteer')
const login = require('../../utils/login')

const { BASE_URL, HOME_URL, HISTORY_URL } = require('../../constants')

let browser
let page

const selectors = {
  backButton: '[data-id="backButton"]',
  homeButton: '[data-id="homeButton"]',
  homeScreen: '[data-id="homeScreen"]',
  historyScreen: '[data-id="historyScreen"]'
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

afterAll(async () => {
  await browser.close()
})

describe('historyScreen navigation', () => {
  it('navigates to homeScreen on home button click', async () => {
    const homeButton = await page.waitForSelector(selectors.homeButton)
    homeButton.click()
    await page.waitForSelector(selectors.homeScreen)
    expect(page.url()).toEqual(HOME_URL)
  })
})
