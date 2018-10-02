const puppeteer = require('puppeteer')
const login = require('../utils/login')

const {
  BASE_URL,
  AUTH_URL,
  REQUEST_URL,
  HOME_URL,
  HOME_SELECTOR
} = require('../constants')
let browser
let page

const notFoundSelector = '[data-id="not-found"]'

beforeEach(function() {
  originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000
})

beforeAll(async () => {
  browser = await puppeteer.launch({
    args: ['--no-sandbox']
  })

  page = await browser.newPage()
  await page.goto(BASE_URL)
})

test('redirects to auth if unauthenticated user navigates to private route', async () => {
  expect(page.url()).toEqual(AUTH_URL)

  await page.goto(REQUEST_URL)
  await page.waitForSelector('.create-account-logo-link')
  expect(page.url()).toEqual(AUTH_URL)
})

test('redirects to not found if route doesnt exist', async () => {
  await page.goto(`${AUTH_URL}/not-valid-route`)
  await page.waitForSelector(notFoundSelector)
  const notFound = await page.$$eval(notFoundSelector, list => list.length)
  expect(notFound).toEqual(1)
})

test(
  'redirects to /account after login',
  async () => {
    await page.goto(AUTH_URL)
    await login(page)
    await page.waitForSelector(HOME_SELECTOR)
    expect(page.url()).toEqual(HOME_URL)
  },
  20000
)

test('redirects to not found if route doesnt exist after login', async () => {
  await page.goto(`${BASE_URL}/not-valid-route`)
  await page.waitForSelector(notFoundSelector)
  const notFound = await page.$$eval(notFoundSelector, list => list.length)
  expect(notFound).toEqual(1)
})
