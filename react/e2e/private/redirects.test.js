const puppeteer = require('puppeteer')
const login = require('../utils/login')

const { BASE_URL, HOME_URL } = require('../constants')
let browser
let page

const notFoundSelector = '[data-id="not-found"]'

beforeEach(function() {
  originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000
})

beforeAll(async () => {
  browser = await puppeteer.launch({
    args: ['--no-sandbox']
  })

  page = await browser.newPage()
  await page.goto(BASE_URL)
})

afterAll(async () => {
  await browser.close()
})

test(
  'redirects to not found if route doesnt exist after login',
  async () => {
    await page.goto(HOME_URL)
    page = await login(page)
    await page.goto(`${HOME_URL}/not-valid-route`)
    await page.waitForSelector(notFoundSelector)
    const notFound = await page.$$eval(notFoundSelector, list => list.length)
    expect(notFound).toEqual(1)
  },
  30000
)
