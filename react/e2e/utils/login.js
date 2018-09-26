const login = async page => {
  await page.waitForSelector('button[data-id="login"]')
  const accountInput = await page.$('[name=account]')
  await accountInput.type('JoeSmith')
  const passwordInput = await page.$('[name=password]')
  await passwordInput.type('password')
  await page.keyboard.press('Enter')
  await page.goto('localhost:3000/account')
  await page.waitForSelector('[name="account"]')
}

module.exports = login
