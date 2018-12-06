const { BASE_URL, HOME_SELECTOR } = require('../constants')

const login = async page => {
  page.goto(BASE_URL)
  await page.waitForSelector('button[data-id="login"]')
  const accountInput = await page.$('[name=account]')
  await accountInput.type('JoeSmith')
  const passwordInput = await page.$('[name=password]')
  await passwordInput.type('password')
  await page.keyboard.press('Enter')
  await page.waitForSelector(HOME_SELECTOR)
}

module.exports = login
