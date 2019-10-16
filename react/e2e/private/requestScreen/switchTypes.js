const puppeteer = require('puppeteer')
const login = require('../../utils/login')

const { BASE_URL, REQUEST_URL, TEST_ACCOUNT } = require('../../constants')

const activeButtonSelector = 'button[data-id="activeButton"]'
const rejectedButtonSelector = 'button[data-id="rejectedButton"]'

let browser
let page

beforeAll(async () => {
  browser = await puppeteer.launch({
    args: ['--no-sandbox']
  })

  page = await browser.newPage()
  await page.goto(BASE_URL)
  page = await login(page, TEST_ACCOUNT, process.env.JEST_SECRET)
  await page.goto(REQUEST_URL)
  await page.waitForSelector(activeButtonSelector)
})

afterAll(async () => {
  await browser.close()
})

it('switches types', async () => {
  const rejectedButton = await page.$(rejectedButtonSelector)
  const activeButtonStatus = await page.$eval(activeButtonSelector, element =>
    element.getAttribute('data-active')
  )

  expect(activeButtonStatus).toBe('true')
  await rejectedButton.click()

  const activeButtonStatusAfterClick = await page.$eval(
    activeButtonSelector,
    element => element.getAttribute('data-active')
  )
  const rejectedButtonStatusAfterClick = await page.$eval(
    rejectedButtonSelector,
    element => element.getAttribute('data-active')
  )

  expect(activeButtonStatusAfterClick).toBe('false')
  expect(rejectedButtonStatusAfterClick).toBe('true')
})
