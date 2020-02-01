const puppeteer = require('puppeteer')
const { login } = require('../../utils/auth')
const { addTransaction } = require('../homeScreen/utils')
const {
  SELECTORS,
  HOME_URL,
  REQUEST_URL,
  TEST_ACCOUNTS
} = require('../../constants')

describe('transaction request', () => {
  beforeAll(async () => {
    jest.setTimeout(30000)
    await page.goto(HOME_URL)
    await page.waitForSelector(SELECTORS.HOME)
  })

  afterAll(async () => {
    await login(page, TEST_ACCOUNTS[0], process.env.JEST_SECRET)
  })

  it('displays stored request', async () => {
    await login(page, TEST_ACCOUNTS[2], process.env.JEST_SECRET)
    await page.type(SELECTORS.recipient, TEST_ACCOUNTS[1])

    // select credit type transaction
    await page.click(SELECTORS.creditButton)

    const getRoundedPriceAsFloat = () => {
      let price = Math.random() * Math.floor(100)
      return Math.round(price * 1000) / 1000
    }

    const salesTaxRate = 1.09
    const milkPrice = getRoundedPriceAsFloat()
    const milkPriceAsString = milkPrice.toFixed(3)
    const milkQuantity = 2

    const breadPrice = getRoundedPriceAsFloat()
    const breadPriceAsString = breadPrice.toFixed(3)
    const breadQuantity = 4

    const expectedPriceWithTax =
      Math.round(
        (milkPrice * milkQuantity + breadPrice * breadQuantity) *
          salesTaxRate *
          1000
      ) / 1000
    const expectedPriceWithTaxAsString = expectedPriceWithTax.toFixed(3)

    // create request
    await addTransaction(page, {
      name: 'milk',
      price: milkPriceAsString,
      quantity: '2'
    })

    await addTransaction(page, {
      name: 'bread',
      price: breadPriceAsString,
      quantity: '4'
    })

    await page.waitForSelector('.updated')

    // request transacton where sender will see a positive number
    await page.click(SELECTORS.requestCreditTransactionBtn)
    await page.waitForSelector(SELECTORS.activeButton, { timeout: 30000 })
    await page.goto(REQUEST_URL)
    await page.waitForSelector(SELECTORS.requestItem)
    const requestItemElement = await page.$(SELECTORS.requestItem)
    await requestItemElement.click()
    await page.waitForSelector(SELECTORS.requestingAccountIndicator)
    const contraAccountValue = await page.$eval(
      SELECTORS.requestingAccountIndicator,
      e => e.innerText
    )
    expect(contraAccountValue).toBe(TEST_ACCOUNTS[1])

    const requestTotalValue = await page.$eval(
      SELECTORS.sumTransactionItemIndicator,
      e => e.innerText
    )
    expect(requestTotalValue).toBe(expectedPriceWithTaxAsString)

    const requestRuleInstanceID = await page.$eval(
      SELECTORS.ruleInstanceIdsIndicator,
      e => e.innerText
    )
    expect(requestRuleInstanceID).toBe('8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d')
  })
})
