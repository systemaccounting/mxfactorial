const { SELECTORS, HOME_URL } = require('../../constants')

beforeAll(async () => {
  await page.goto(HOME_URL)
  await page.waitForSelector(SELECTORS.HOME)
})

describe('Notifications menu', () => {
  it('closes menu when clicked elsewhere', async () => {
    const notificationBtn = await page.$(SELECTORS.notificationButton)
    notificationBtn.click()
    await page.waitForSelector(SELECTORS.notificationsMenu)
    expect(await page.$$(SELECTORS.notificationsMenu)).toHaveLength(1)

    await page.click(SELECTORS.homeButton)
    const notificationsMenu = await page.$$(SELECTORS.notificationsMenu)
    expect(notificationsMenu).toHaveLength(0)
  })

  it('closes menu when clicked on clear btn', async () => {
    const notificationBtn = await page.$(SELECTORS.notificationButton)
    notificationBtn.click()
    await page.waitForSelector(SELECTORS.notificationsMenu)
    expect(await page.$$(SELECTORS.notificationsMenu)).toHaveLength(1)

    await page.click(SELECTORS.notificationsClearBtn)
    const notificationsMenu = await page.$$(SELECTORS.notificationsMenu)
    expect(notificationsMenu).toHaveLength(0)
  })
})
