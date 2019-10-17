const { SELECTORS, AUTH_URL } = require('../constants')

// todo: create user before test
const auth = async (page, login, password) => {
  await page.goto(AUTH_URL, { waitUntil: 'networkidle2' })
  await page.type('[name=account]', login)
  await page.type('[name=password]', password)
  await page.keyboard.press('Enter')
  await page.waitForNavigation({ waitUntil: 'networkidle2' })
}

const logout = async page => {
  const navBtn = await page.$('[data-id="nav-button"]')
  await navBtn.click()

  const signOutBtn = await page.$('[data-name="sign-out"]')
  await signOutBtn.click()

  await page.waitForSelector(SELECTORS.landingScreenLogo)
}

module.exports = {
  login: auth,
  logout
}
