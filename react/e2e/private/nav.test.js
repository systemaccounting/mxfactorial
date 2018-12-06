const { BASE_URL, HOME_URL, HOME_SELECTOR } = require('../constants')
const login = require('../utils/login')

beforeAll(async () => {
  await page.goto(HOME_URL)
  await page.waitForSelector(HOME_SELECTOR)
})

afterAll(async () => {
  await login(page)
})

it('mobile nav button displays', async () => {
  const navBtn = await page.$$('[data-id="nav-button"]')
  expect(navBtn).toHaveLength(1)
})

it('menu list displays on nav button click', async () => {
  const navBtn = await page.$('[data-id="nav-button"]')
  await navBtn.click()

  const navMenu = await page.$$('[data-id="nav-menu"]')
  expect(navMenu).toHaveLength(1)

  const navMenuItems = await page.$$('[data-id="nav-menu-item"]')
  expect(navMenuItems).toHaveLength(6)

  // TODO: add menu items
})

it('nav menu mask displays on nav button click', async () => {
  const navBtn = await page.$('[data-id="nav-button"]')
  await navBtn.click()

  const navMask = await page.$$('[data-id="nav-mask"]')
  expect(navMask).toHaveLength(1)
})

it('signs out', async () => {
  const navBtn = await page.$('[data-id="nav-button"]')
  await navBtn.click()

  const signOutBtn = await page.$('[data-name="sign-out"]')
  await signOutBtn.click()

  await page.waitForNavigation()

  expect(page.url()).toEqual(`${BASE_URL}/auth`)
})
