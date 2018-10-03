const puppeteer = require('puppeteer')

const { AUTH_URL, HOME_URL } = require('./constants')
let browser
let page

beforeAll(async () => {
  browser = await puppeteer.launch({
    args: ['--no-sandbox']
  })

  page = await browser.newPage()
})

afterAll(async () => {
  browser.close()
})

test(
  'logs in and redirects to /account',
  async () => {
    await page.goto(AUTH_URL)
    await page.waitForSelector('button[data-id="login"]')
    const accountInput = await page.$('[name=account]')
    await accountInput.type('JoeSmith')
    const passwordInput = await page.$('[name=password]')
    await passwordInput.type('password')
    await page.keyboard.press('Enter')

    await page.waitForNavigation({ waitUntil: 'networkidle2' })
    expect(page.url()).toEqual(HOME_URL)
  },
  100000
)
