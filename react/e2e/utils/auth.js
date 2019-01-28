const { AUTH_URL } = require('../constants')

const auth = async page => {
  page.goto(AUTH_URL)
  await page.waitForSelector('button[data-id="login"]')
  const accountInput = await page.$('[name=account]')
  await accountInput.type('JoeSmith')
  const passwordInput = await page.$('[name=password]')
  await passwordInput.type('password')
  await page.keyboard.press('Enter')
  await page.waitForNavigation({ waitUntil: 'networkidle2' })
}

const logout = async page => {
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
