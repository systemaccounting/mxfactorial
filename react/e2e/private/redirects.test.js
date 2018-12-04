const { BASE_URL, HOME_URL } = require('../constants')

const notFoundSelector = '[data-id="not-found"]'

// beforeEach(function() {
//   originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
//   jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000
// })

beforeAll(async () => {
  await page.goto(BASE_URL)
})

it('redirects to not found if route doesnt exist after login', async () => {
  await page.goto(`${HOME_URL}/not-valid-route`)
  await page.waitForSelector(notFoundSelector)
  const notFound = await page.$$eval(notFoundSelector, list => list.length)
  expect(notFound).toEqual(1)
})
