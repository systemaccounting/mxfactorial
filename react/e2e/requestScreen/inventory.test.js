const puppeteer = require('puppeteer')
const login = require('../utils/login')

const { BASE_URL, REQUEST_URL } = require('../constants')

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
  page = await login(page)
  await page.goto(REQUEST_URL)
  await page.waitForSelector(activeButtonSelector)
})

afterAll(async () => {
  browser.close()
})

test('active button displays', async () => {
  const activeButton = await page.$$eval(
    activeButtonSelector,
    list => list.length
  )
  expect(activeButton).toEqual(1)
})

test('rejected button displays', async () => {
  const rejectedButton = await page.$$eval(
    rejectedButtonSelector,
    list => list.length
  )
  expect(rejectedButton).toEqual(1)
})
