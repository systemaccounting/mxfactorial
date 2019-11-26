const { SELECTORS, HOME_URL } = require('../../constants')

beforeAll(async () => {
  await page.goto(HOME_URL)
  await page.waitForSelector(SELECTORS.HOME)
})

describe('Notifications menu inventory', () => {
  it('has notifications menu button', async () => {
    const notificationBtn = await page.$$(SELECTORS.notificationButton)
    expect(notificationBtn).toHaveLength(1)
  })

  it('has notificatons menu', async () => {
    const notificationBtn = await page.$(SELECTORS.notificationButton)
    notificationBtn.click()
    await page.waitForSelector(SELECTORS.notificationsMenu)

    const notificationsMenu = await page.$$(SELECTORS.notificationsMenu)
    const notificationsClearBtn = await page.$$(SELECTORS.notificationsClearBtn)
    const notificationsMenuItem = await page.$$(SELECTORS.notificationsMenuItem)

    expect(notificationsMenu).toHaveLength(1)
    expect(notificationsClearBtn).toHaveLength(1)
    expect(notificationsMenuItem.length).toBeGreaterThanOrEqual(1)
  })
})
