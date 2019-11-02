const { HOME_URL, BASE_URL, TEST_ACCOUNTS, SELECTORS } = require('../constants')
const { login } = require('../utils/auth')

beforeEach(async () => {
  jest.setTimeout(20000)
  await page.goto(BASE_URL)
  await page.waitForSelector(SELECTORS.createAccountButton)
})

afterEach(async () => {
  const navBtn = await page.$(SELECTORS.navButton)
  await navBtn.click()

  await page.waitForSelector(SELECTORS.signOutButton)
  // query selector from document used after puppeteer selector failure
  await page.evaluate(() => {
    let signOut = document.querySelector('[data-name="sign-out"]')
    signOut.click()
  })

  await page.waitForSelector(SELECTORS.landingScreenLogo)
})

it('logs in and redirects to /account', async () => {
  await login(page, TEST_ACCOUNTS[0], process.env.JEST_SECRET)
  expect(await page.url()).toEqual(HOME_URL)
}, 100000)
