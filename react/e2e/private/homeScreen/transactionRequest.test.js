const { login } = require('../../utils/auth')
const { addTransaction, getTotal, milk, bread, honey } = require('./utils')
const { HOME_URL, HOME_SELECTOR, REQUEST_URL } = require('../../constants')

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
  it.skip('redirects to history screen after successful transaction request', async () => {
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
    await login('Person1', 'password')

    await page.type(recipientSelector, 'Person2')
    // Select credit type transaction
    await page.click(debitSelector)

    await addTransaction(page, milk)
    await addTransaction(page, honey)
    await addTransaction(page, bread)
    await getTotal()

    // Request transacton
    await page.click(requestDebitTransactionBtn)

    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 5000 })
    const lastItemId1 = await page.$eval(requestItemSelector, e => e.getAttribute('data-request-id'));

    await login('Person2', 'password')
    await page.goto(REQUEST_URL, { waitUntil: 'networkidle2' })
    await page.waitForSelector(requestItemSelector);
    const lastItemId2 = await page.$eval(requestItemSelector, e => e.getAttribute('data-request-id'));

    expect(lastItemId1).toEqual(11)
  }, 20000)
})
