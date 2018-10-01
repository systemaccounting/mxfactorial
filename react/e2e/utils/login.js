const login = async page => {
  await page.waitForSelector('button[data-id="login"]')
  const accountInput = await page.$('[name=account]')
  await accountInput.type('JoeSmith')
  const passwordInput = await page.$('[name=password]')
  await passwordInput.type('password')
  await page.keyboard.press('Enter')
  await page.waitForNavigation()
}

module.exports = login
