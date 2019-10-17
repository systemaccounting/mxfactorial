const PuppeteerEnvironment = require('jest-environment-puppeteer')
const { login } = require('../../utils/auth')
const { TEST_ACCOUNTS } = require('../../constants')

let isLoggedIn = false

class CustomEnvironment extends PuppeteerEnvironment {
  async setup() {
    await super.setup()
    // Your setup
    if (!isLoggedIn) {
      const { page } = this.global
      await login(page, TEST_ACCOUNTS[0], process.env.JEST_SECRET)
      isLoggedIn = true
    }
  }

  async teardown() {
    // Your teardown
    await super.teardown()
  }
}

module.exports = CustomEnvironment
