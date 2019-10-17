const { SELECTORS, BASE_URL, HOME_URL } = require('../constants')

// beforeEach(function() {
//   originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
//   jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000
// })

beforeAll(async () => {
  jest.setTimeout(30000)
  await page.goto(BASE_URL)
})

it('redirects to not found if route doesnt exist after login', async () => {
  await page.goto(`${HOME_URL}/not-valid-route`)
  await page.waitForSelector(SELECTORS.notFound)
  const notFound = await page.$$eval(SELECTORS.notFound, list => list.length)
  expect(notFound).toEqual(1)
})
