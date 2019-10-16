const { login } = require('../../utils/auth')
const { addTransaction, getTotal, milk, bread, honey } = require('./utils')
const {
  HOME_URL,
  HOME_SELECTOR,
  REQUEST_URL,
  TEST_ACCOUNT
} = require('../../constants')

const creditSelector = 'button[name="credit"]'
const debitSelector = 'button[name="debit"]'
const requestCreditTransactionBtn = "button[data-id='credit']"
const requestDebitTransactionBtn = "button[data-id='debit']"
const recipientSelector = '[name="recipient"]'
const requestItemSelector = '[data-id="requestItemIndicator"]'

beforeAll(async () => {
  await page.goto(HOME_URL)
  await page.waitForSelector(HOME_SELECTOR)
})

afterAll(async () => {
  await page.reload()
})

describe('transaction request', async () => {
  it('redirects to history screen after successful transaction request', async () => {
    // Assert receiving successful response from the api
    page.on('response', response => {
      if (response.url().match('api')) {
        expect(response.status()).toBe(200)
      }
    })

    await addTransaction(page, milk)
    await addTransaction(page, honey)
    await addTransaction(page, bread)
    await getTotal()

    // Select credit type transaction
    const creditButton = await page.$(creditSelector)
    await creditButton.click()

    // Request transacton
    await page.click(requestCreditTransactionBtn)

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 })

    // redirect to historyScreen
    await expect(page.url()).toMatch(REQUEST_URL)
  }, 20000)

  it('displays stored transaction', async () => {
    // Login as Person2
    const page2 = await browser.newPage()
    await login(page2, 'Person2', 'password')
    await page2.goto(REQUEST_URL)
    await page2.waitForSelector(requestItemSelector)

    await login(page, 'Person1', 'password')

    await page.type(recipientSelector, 'Person2')

    // Select credit type transaction
    await page.click(debitSelector)

    const expectedPrice = (Math.random() * Math.floor(100))
      .toFixed(3)
      .toString()

    // Create transaction
    await addTransaction(page, {
      name: 'Milk',
      price: expectedPrice,
      quantity: '1'
    })
    await getTotal()

    // Request transacton
    await page.click(requestDebitTransactionBtn)
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 })

    await page2.reload()
    await page2.waitForSelector(requestItemSelector)

    // Assert transaction from Person1 received
    expect(await page2.content()).toMatch(expectedPrice)

    await page2.close()
    await login(page, TEST_ACCOUNT, process.env.JEST_SECRET)
  }, 30000)
})
