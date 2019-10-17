const { HOME_URL, TEST_ACCOUNTS } = require('../constants')
const { login, logout } = require('../utils/auth')

afterAll(async () => {
  await logout(page)
})

it('logs in and redirects to /account', async () => {
  await login(page, TEST_ACCOUNTS[0], process.env.JEST_SECRET)
  expect(await page.url()).toEqual(HOME_URL)
}, 100000)
