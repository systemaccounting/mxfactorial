const puppeteer = require('puppeteer')
const login = require('./utils/login')

const BASE_URL = 'http://localhost:3000'
let browser
let page

beforeEach(function() {
  originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000
})

beforeAll(async () => {
  browser = await puppeteer.launch({
    args: ['--no-sandbox']
  })

  page = await browser.newPage()
  await page.goto(BASE_URL)
  await login(page)
})

test('mobile nav button displays', async () => {
  const navBtn = await page.$$('[data-id="nav-button"]')
  expect(navBtn).toHaveLength(1)
})

test('menu list displays on nav button click', async () => {
  const navBtn = await page.$('[data-id="nav-button"]')
  await navBtn.click()

  const navMenu = await page.$$('[data-id="nav-menu"]')
  expect(navMenu).toHaveLength(1)

  const navMenuItems = await page.$$('[data-id="nav-menu-item"]')
  expect(navMenuItems).toHaveLength(6)

  // TODO: add menu items
})

test('nav menu mask displays on nav button click', async () => {
  const navBtn = await page.$('[data-id="nav-button"]')
  await navBtn.click()

  const navMask = await page.$$('[data-id="nav-mask"]')
  expect(navMask).toHaveLength(1)
})

test(
  'signs out',
  async () => {
    const navBtn = await page.$('[data-id="nav-button"]')
    await navBtn.click()

    const signOutBtn = await page.$('[data-name="sign-out"]')
    await signOutBtn.click()

    await page.waitForNavigation()

    expect(page.url()).toEqual(`${BASE_URL}/auth`)
  },
  20000
)
