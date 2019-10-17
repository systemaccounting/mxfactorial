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

describe('transaction request', async () => {
  it('redirects to history screen after successful transaction request', async () => {
    // Assert receiving successful response from the api
    page.on('response', response => {
      if (response.url().match('api')) {
        expect(response.status()).toBe(200)
      }
    })
    // send transaction request to account in next test to avoid test failure
    // in environment with empty db table https://github.com/systemaccounting/mxfactorial/issues/109
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

    // redirect to historyScreen
    await expect(page.url()).toMatch(REQUEST_URL)
  })

  it('displays stored transaction', async () => {
    // Login as TEST_ACCOUNT_02 (TEST_ACCOUNTS[1])
    const page2 = await browser.newPage()
    await login(page2, TEST_ACCOUNTS[1], process.env.JEST_SECRET)
    await page2.goto(REQUEST_URL)
    await page2.waitForSelector(SELECTORS.requestItem)

    await login(page, TEST_ACCOUNTS[2], process.env.JEST_SECRET)

    await page.type(SELECTORS.recipient, TEST_ACCOUNTS[1])

    // Select credit type transaction
    await page.click(SELECTORS.debitButton)

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
    await page.click(SELECTORS.requestDebitTransactionBtn)
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 })

    await page2.reload()
    await page2.waitForSelector(SELECTORS.requestItem)

    // Assert transaction from Person1 received
    expect(await page2.content()).toMatch(expectedPrice)

    await page2.close()
    await login(page, TEST_ACCOUNTS[0], process.env.JEST_SECRET)
  })
})
