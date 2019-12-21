const { SELECTORS, BASE_URL, AUTH_URL, REQUEST_URL } = require('../constants')

beforeAll(async () => {
  jest.setTimeout(20000)
})

beforeEach(async () => {
  await page.goto(BASE_URL)
  await page.waitForSelector(SELECTORS.createAccountButton)
})

it('redirects to auth if unauthenticated user navigates to private route', async () => {
  await page.goto(REQUEST_URL, {
    waitUntil: 'networkidle2'
  })
  await expect(page.url()).toEqual(AUTH_URL)
})

it('redirects /auth if route doesnt exist', async () => {
  await page.goto(`${AUTH_URL}/not-valid-route`)
  await page.waitForSelector(SELECTORS.createAccountButton)
  expect(page.url()).toBe(AUTH_URL)
})
