const { HOME_URL } = require('../constants')
const { login, logout } = require('../utils/auth')

afterAll(async () => {
  await logout()
})

it('logs in and redirects to /account', async () => {
  await login()
  expect(await page.url()).toEqual(HOME_URL)
}, 100000)
