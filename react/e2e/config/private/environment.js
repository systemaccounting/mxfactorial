const PuppeteerEnvironment = require('jest-environment-puppeteer')
const { BASE_URL, HOME_SELECTOR } = require('../../constants')

let isLoggedIn = false

class CustomEnvironment extends PuppeteerEnvironment {
  async setup() {
    await super.setup()
    // Your setup
    if (!isLoggedIn) {
      const { page } = this.global
      page.goto(BASE_URL)
      await page.waitForSelector('button[data-id="login"]')
      const accountInput = await page.$('[name=account]')
      await accountInput.type('JoeSmith')
      const passwordInput = await page.$('[name=password]')
      await passwordInput.type('password')
      await page.keyboard.press('Enter')
      await page.waitForSelector(HOME_SELECTOR)
      isLoggedIn = true
    }
  }

  async teardown() {
    // Your teardown
    await super.teardown()
  }
}

module.exports = CustomEnvironment
