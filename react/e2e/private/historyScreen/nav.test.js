const { SELECTORS, HOME_URL, HISTORY_URL } = require('../../constants')

beforeAll(async () => {
  jest.setTimeout(30000)
  await page.goto(HISTORY_URL)
})

describe('historyScreen navigation', () => {
  it('navigates to homeScreen on home button click', async () => {
    const homeButton = await page.waitForSelector(SELECTORS.homeButton)
    homeButton.click()
    await page.waitForSelector(SELECTORS.homeScreen)
    expect(page.url()).toEqual(HOME_URL)
  })
})
