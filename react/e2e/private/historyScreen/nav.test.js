const { HOME_URL, HISTORY_URL } = require('../../constants')

const selectors = {
  backButton: '[data-id="backButton"]',
  homeButton: '[data-id="homeButton"]',
  homeScreen: '[data-id="homeScreen"]',
  historyScreen: '[data-id="historyScreen"]'
}

beforeAll(async () => {
  await page.goto(HISTORY_URL)
})

describe('historyScreen navigation', () => {
  it('navigates to homeScreen on home button click', async () => {
    const homeButton = await page.waitForSelector(selectors.homeButton)
    homeButton.click()
    await page.waitForSelector(selectors.homeScreen)
    expect(page.url()).toEqual(HOME_URL)
  })
})
