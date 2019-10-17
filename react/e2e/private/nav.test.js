const { SELECTORS, BASE_URL, HOME_URL, TEST_ACCOUNTS } = require('../constants')
const { login, logout } = require('../utils/auth')

beforeAll(async () => {
  jest.setTimeout(30000)
  await page.goto(HOME_URL)
  await page.waitForSelector(SELECTORS.HOME)
})

afterAll(async () => {
  await login(page, TEST_ACCOUNTS[0], process.env.JEST_SECRET)
})

describe('Mobile Menu Navigation', () => {
  it('displays mobile nav button', async () => {
    const navBtn = await page.$$(SELECTORS.navButton)
    expect(navBtn).toHaveLength(1)
  })

  it('displays menu list on nav button click', async () => {
    const navBtn = await page.$(SELECTORS.navButton)
    await navBtn.click()

    const navMenu = await page.$$(SELECTORS.navMenu)
    expect(navMenu).toHaveLength(1)

    const navMenuItems = await page.$$(SELECTORS.navMenuItem)
    expect(navMenuItems).toHaveLength(6)

    // TODO: add menu items
  })

  it("doesn't display test menu items", async () => {
    const navMenuItems = await page.$$(SELECTORS.navMenuTestItem)
    expect(navMenuItems).toHaveLength(0)
  })

  it('displays nav menu mask on nav button click', async () => {
    const navBtn = await page.$(SELECTORS.navButton)
    await navBtn.click()

    const navMask = await page.$$(SELECTORS.navMask)
    expect(navMask).toHaveLength(1)
  })

  it('signs out', async () => {
    await logout(page)
    expect(page.url()).toEqual(`${BASE_URL}/auth`)
  })
})
