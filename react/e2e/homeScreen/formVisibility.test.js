const puppeteer = require('puppeteer')
const login = require('../utils/login')
const { addTransaction, milk, honey } = require('./utils')
const { BASE_URL, HOME_URL, HOME_SELECTOR } = require('../constants')

const transactionDeleteSelector = 'button[name="delete-transaction"]'
const transactionClearSelector = 'button[data-id="transaction-clear"]'
const transactionFormToggleSelector = 'button[data-id="hide-show-form"]'

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

const getInputByValue = async value =>
  await page.$$eval(`input[value="${value}"]`, element => element.length)

describe('form visibility after transaction deletion', () => {
  test(
    'adds milk and draft honey',
    async () => {
      await addTransaction(page, milk)
      await addTransaction(page, honey, true)
    },
    20000
  )

  test(
    'clear form (honey)',
    async () => {
      const clearBtn = await page.$(transactionClearSelector)
      await clearBtn.click()
      expect(await getInputByValue('honey')).toEqual(0) // honey is cleared

      const toggleButton = await page.$$(transactionFormToggleSelector)
      expect(toggleButton).toHaveLength(0)
    },
    20000
  )

  test(
    'hide form',
    async () => {
      const clearBtn = await page.$(transactionClearSelector)
      await clearBtn.click()

      // Toggle button only appears if transaction form is hidden.
      const toggleButton = await page.$$(transactionFormToggleSelector)
      expect(toggleButton).toHaveLength(1)
    },
    20000
  )

  test(
    'remove milk',
    async () => {
      const deleteButton = await page.$(transactionDeleteSelector)
      await deleteButton.click()
      const toggleButton = await page.$$(transactionFormToggleSelector)
      expect(toggleButton).toHaveLength(0)
    },
    20000
  )
})
