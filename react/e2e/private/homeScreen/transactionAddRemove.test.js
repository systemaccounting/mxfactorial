const puppeteer = require('puppeteer')
const login = require('../../utils/login')
const { addTransaction, milk, bread, honey } = require('./utils')
const { BASE_URL, HOME_URL, HOME_SELECTOR } = require('../../constants')

const transactionDeleteSelector = 'button[name="delete-transaction"]'
const transactionClearSelector = 'button[data-id="transaction-clear"]'

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
  await browser.close()
})

const getInputByValue = async value =>
  await page.$$eval(`input[value="${value}"]`, element => element.length)

const getTotal = async () =>
  await page.$eval('[name="total-value"]', element => element.innerHTML)

describe('transaction add remove (milk, honey, bread)', () => {
  test(
    'adds three items',
    async () => {
      expect(await getTotal()).toEqual('0')

      await addTransaction(page, milk)
      expect(await getTotal()).toEqual('20')

      await addTransaction(page, honey)
      expect(await getTotal()).toEqual('60')

      await addTransaction(page, bread, true) // draft
      expect(await getTotal()).toEqual('80')
    },
    20000
  )

  test(
    'item names should be corect',
    async () => {
      expect(await getInputByValue('milk')).toEqual(1)
      expect(await getInputByValue('honey')).toEqual(1)
      expect(await getInputByValue('bread')).toEqual(1)
    },
    20000
  )

  test(
    'delete milk and check result',
    async () => {
      const deleteButton = await page.$(transactionDeleteSelector)

      // delete milk
      await deleteButton.click()
      expect(await getTotal()).toEqual('60')

      expect(await getInputByValue('milk')).toEqual(0)
      expect(await getInputByValue('honey')).toEqual(1)
      expect(await getInputByValue('bread')).toEqual(1)
    },
    20000
  )

  test(
    'delete honey and check result',
    async () => {
      const deleteButton = await page.$(transactionDeleteSelector)
      // delete honey
      await deleteButton.click()
      expect(await getTotal()).toEqual('20')

      expect(await getInputByValue('milk')).toEqual(0)
      expect(await getInputByValue('honey')).toEqual(0)
      expect(await getInputByValue('bread')).toEqual(1)
    },
    20000
  )

  test(
    'clear draft transaction and check result',
    async () => {
      const deleteButton = await page.$(transactionClearSelector)

      // delete bread
      await deleteButton.click()
      expect(await getTotal()).toEqual('0')

      expect(await getInputByValue('milk')).toEqual(0)
      expect(await getInputByValue('honey')).toEqual(0)
      expect(await getInputByValue('bread')).toEqual(0)
    },
    20000
  )

  test(
    'add milk again after deleting added items',
    async () => {
      await addTransaction(page, milk)
      expect(await getTotal()).toEqual('20')
      expect(await getInputByValue('milk')).toEqual(1)
    },
    20000
  )

  test(
    'delete milk again',
    async () => {
      const deleteButton = await page.$(transactionDeleteSelector)
      // delete milk
      await deleteButton.click()
      expect(await getTotal()).toEqual('0')
      expect(await getInputByValue('milk')).toEqual(0)
    },
    20000
  )

  test(
    'add honey again',
    async () => {
      await addTransaction(page, honey, true) // draft
      expect(await getTotal()).toEqual('40')
      expect(await getInputByValue('honey')).toEqual(1)
    },
    20000
  )

  test(
    'delele honey again',
    async () => {
      const deleteButton2 = await page.$(transactionClearSelector)
      // delete honey
      await deleteButton2.click()
      expect(await getTotal()).toEqual('0')
      expect(await getInputByValue('honey')).toEqual(0)
    },
    20000
  )
})
