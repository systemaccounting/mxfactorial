const puppeteer = require('puppeteer')

const { BASE_URL, AUTH_URL, REQUEST_URL } = require('../constants')
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
  'redirects to auth if unauthenticated user navigates to private route',
  async () => {
    await page.goto(REQUEST_URL)
    await page.waitForSelector('.create-account-logo-link')
    expect(await page.url()).toEqual(AUTH_URL)
  },
  30000
)

test(
  'redirects to not found if route doesnt exist',
  async () => {
    await page.goto(`${AUTH_URL}/not-valid-route`)
    await page.waitForSelector(notFoundSelector)
    const notFound = await page.$$eval(notFoundSelector, list => list.length)
    expect(notFound).toEqual(1)
  },
  30000
)
