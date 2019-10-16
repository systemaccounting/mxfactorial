const {
  BASE_URL,
  HOME_URL,
  HOME_SELECTOR,
  TEST_ACCOUNT
} = require('../constants')
const { login, logout } = require('../utils/auth')

beforeAll(async () => {
  await page.goto(HOME_URL)
  await page.waitForSelector(HOME_SELECTOR)
})

afterAll(async () => {
  await login(page, TEST_ACCOUNT, process.env.JEST_SECRET)
})

describe('Mobile Menu Navigation', () => {
  it('displays mobile nav button', async () => {
    const navBtn = await page.$$('[data-id="nav-button"]')
    expect(navBtn).toHaveLength(1)
  })

  it('displays menu list on nav button click', async () => {
    const navBtn = await page.$('[data-id="nav-button"]')
    await navBtn.click()

    const navMenu = await page.$$('[data-id="nav-menu"]')
    expect(navMenu).toHaveLength(1)

    const navMenuItems = await page.$$('[data-id="nav-menu-item"]')
    expect(navMenuItems).toHaveLength(6)

    // TODO: add menu items
  })

  it("doesn't display test menu items", async () => {
    const navMenuItems = await page.$$('[data-id="nav-menu-test-item"]')
    expect(navMenuItems).toHaveLength(0)
  })

  it('displays nav menu mask on nav button click', async () => {
    const navBtn = await page.$('[data-id="nav-button"]')
    await navBtn.click()

    const navMask = await page.$$('[data-id="nav-mask"]')
    expect(navMask).toHaveLength(1)
  })

  it('signs out', async () => {
    await logout(page)
    expect(page.url()).toEqual(`${BASE_URL}/auth`)
  })
})
