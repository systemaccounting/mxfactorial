const { AUTH_URL } = require('../constants')

const auth = async (login = 'JoeSmith', password = 'password') => {
  await page.goto(AUTH_URL, { waitUntil: 'networkidle2' })
  await page.type('[name=account]', login)
  await page.type('[name=password]', password)
  await page.keyboard.press('Enter')
  await page.waitForNavigation({ waitUntil: 'networkidle2' })
}

const logout = async () => {
  const navBtn = await page.$('[data-id="nav-button"]')
  await navBtn.click()

  const signOutBtn = await page.$('[data-name="sign-out"]')
  await signOutBtn.click()

  await page.waitForNavigation()
}

module.exports = {
  login: auth,
  logout
}
