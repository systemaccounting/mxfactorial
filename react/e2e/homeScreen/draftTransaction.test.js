const puppeteer = require('puppeteer')
const login = require('../utils/login')
const { addTransaction, milk, bread, honey } = require('./utils')
const { BASE_URL, HOME_URL, HOME_SELECTOR } = require('../constants')

const transactionClearSelector = 'button[data-id="transaction-clear"]'
const transactionAddNameSelector = 'input[name="transaction-add-name"]'
const transactionAddPriceSelector = 'input[name="transaction-add-price"]'
const transactionAddQuantitySelector = 'input[name="transaction-add-quantity"]'

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

const getTotal = async () =>
  await page.$eval('[name="total-value"]', element => element.innerHTML)

let total = 0

describe('transaction add remove (milk, honey, bread)', () => {
  test(
    'add 1 transaction and 1 draft transaction',
    async () => {
      expect(await getTotal()).toEqual(total.toString())

      await addTransaction(page, milk)
      total += milk.price * milk.quantity
      expect(await getTotal()).toEqual(total.toString())

      await addTransaction(page, honey, true) //draft
      total += honey.price * honey.quantity
      expect(await getTotal()).toEqual(total.toString())
    },
    20000
  )

  test(
    'draft transaction input values',
    async () => {
      const nameInputValue = await page.$eval(
        transactionAddNameSelector,
        element => element.value
      )
      expect(nameInputValue).toEqual(honey.name)

      const priceInputValue = await page.$eval(
        transactionAddPriceSelector,
        element => element.value
      )
      expect(priceInputValue).toEqual(honey.price)

      const quantityInputValue = await page.$eval(
        transactionAddQuantitySelector,
        element => element.value
      )
      expect(quantityInputValue).toEqual(honey.quantity)
    },
    20000
  )

  test(
    'draft transaction gets cleared and form remains',
    async () => {
      const clearButton = await page.$(transactionClearSelector)
      await clearButton.click()

      total = milk.price * milk.quantity
      expect(await getTotal()).toEqual(total.toString())

      const nameInputValue = await page.$eval(
        transactionAddNameSelector,
        element => element.value
      )
      expect(nameInputValue).toEqual('')

      const priceInputValue = await page.$eval(
        transactionAddPriceSelector,
        element => element.value
      )
      expect(priceInputValue).toEqual('')

      const quantityInputValue = await page.$eval(
        transactionAddQuantitySelector,
        element => element.value
      )
      expect(quantityInputValue).toEqual('')
    },
    20000
  )
})
