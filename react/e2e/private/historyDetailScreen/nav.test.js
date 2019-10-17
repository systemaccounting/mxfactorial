const { SELECTORS, HOME_URL, HISTORY_URL } = require('../../constants')

beforeAll(async () => {
  jest.setTimeout(30000)
  await page.goto(HISTORY_URL)
})

beforeEach(async () => {
  const link = await page.waitForSelector(SELECTORS.historyItemIndicator)
  await link.click()
})

describe('historyDetailScreen navigation', () => {
  it('navigates to historyScreen on back button click', async () => {
    const backButton = await page.$(SELECTORS.backButton)
    backButton.click()
    await page.waitForSelector(SELECTORS.historyScreen)
    expect(page.url()).toEqual(HISTORY_URL)
  })

  it('navigates to homeScreen on home button click', async () => {
    const homeButton = await page.$(SELECTORS.homeButton)
    homeButton.click()
    await page.waitForSelector(SELECTORS.homeScreen)
    expect(page.url()).toEqual(HOME_URL)
  })
})
