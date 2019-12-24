const { login } = require('../../utils/auth')
const { addTransaction, getTotal, milk, bread, honey } = require('./utils')
const {
  SELECTORS,
  HOME_URL,
  REQUEST_URL,
  TEST_ACCOUNTS
} = require('../../constants')

beforeAll(async () => {
  jest.setTimeout(30000)
  await page.goto(HOME_URL)
  await page.waitForSelector(SELECTORS.HOME)
})

afterAll(async () => {
  await page.reload()
})

describe('transaction request', () => {
  it('redirects to history screen after successful transaction request', async () => {
    // Assert receiving successful response from the api
    page.on('response', response => {
      if (response.url().match('api')) {
        expect(response.status()).toBe(200)
      }
    })

    await page.type(SELECTORS.recipient, TEST_ACCOUNTS[1])

    await addTransaction(page, milk)
    await addTransaction(page, honey)
    await addTransaction(page, bread)
    await getTotal()

    // Select credit type transaction
    const creditButton = await page.$(SELECTORS.creditButton)
    await creditButton.click()

    // Request transacton
    await page.click(SELECTORS.requestCreditTransactionBtn)

    // await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
    await page.waitForSelector(SELECTORS.requestItem)
    // todo: fix 17921 ms cold start
    // redirect to historyScreen
    await expect(page.url()).toMatch(REQUEST_URL)
  })

  it('displays stored transaction', async () => {
    // login as TEST_ACCOUNT_02 (TEST_ACCOUNTS[1])
    const page2 = await browser.newPage()
    await login(page2, TEST_ACCOUNTS[1], process.env.JEST_SECRET)
    await page2.goto(REQUEST_URL)
    await page2.waitForSelector(SELECTORS.requestItem)

    await login(page, TEST_ACCOUNTS[2], process.env.JEST_SECRET)

    await page.type(SELECTORS.recipient, TEST_ACCOUNTS[1])

    // select credit type transaction
    await page.click(SELECTORS.debitButton)

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

    await getTotal()

    // request transacton
    await page.click(SELECTORS.requestDebitTransactionBtn)
    await page.waitForSelector(SELECTORS.activeButton, { timeout: 30000 })
    // await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })

    await page2.reload()
    await page2.waitForSelector(SELECTORS.requestItem)
    const element = await page.$(SELECTORS.requestItem)
    const content = await (await element.getProperty('textContent')).jsonValue()
    const regex = /- (\d+.\d{3})/
    const requestedTotal = regex.exec(content)[1]
    // Assert transaction from Person1 received
    expect(requestedTotal).toBe(expectedPriceWithTaxAsString)

    await page2.close()
    await login(page, TEST_ACCOUNTS[0], process.env.JEST_SECRET)
  })
})
