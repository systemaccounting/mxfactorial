const puppeteer = require('puppeteer')
const login = require('../utils/login')

const { BASE_URL, HOME_URL, HOME_SELECTOR } = require('../constants')

const creditSelector = 'button[name="credit"]'
const debitSelector = 'button[name="debit"]'

let browser
let page

beforeAll(async () => {
  browser = await puppeteer.launch({
    args: ['--no-sandbox']
  })

  page = await browser.newPage()
  await page.goto(BASE_URL)
  page = await login(page)

  await page.goto(HOME_URL)
  await page.waitForSelector(HOME_SELECTOR)
})

afterAll(async () => {
  browser.close()
})

test('switches between debit and credit', async () => {
  const debitButtonActive = await page.$eval(debitSelector, element =>
    element.getAttribute('data-active')
  )
  expect(debitButtonActive).toEqual('false')

  const creditButtonActive = await page.$eval(creditSelector, element =>
    element.getAttribute('data-active')
  )
  expect(creditButtonActive).toEqual('true')

  const debitButton = await page.$(debitSelector)
  await debitButton.click()

  const creditButtonActive2 = await page.$eval(creditSelector, element =>
    element.getAttribute('data-active')
  )
  expect(creditButtonActive2).toEqual('false')

  const debitButtonActive2 = await page.$eval(debitSelector, element =>
    element.getAttribute('data-active')
  )
  expect(debitButtonActive2).toEqual('true')

  const creditButton = await page.$(creditSelector)
  await creditButton.click()

  const creditButtonActive3 = await page.$eval(creditSelector, element =>
    element.getAttribute('data-active')
  )
  expect(creditButtonActive3).toEqual('true')

  const debitButtonActive3 = await page.$eval(debitSelector, element =>
    element.getAttribute('data-active')
  )
  expect(debitButtonActive3).toEqual('false')
})
