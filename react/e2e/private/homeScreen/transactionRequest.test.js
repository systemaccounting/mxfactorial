const { addTransaction, getTotal, milk, bread, honey } = require('./utils')
const { HOME_URL, HOME_SELECTOR } = require('../../constants')

const creditSelector = 'button[name="credit"]'
const requestTransactionButtonSelector = "button[data-id='credit']"

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
    const requestTransactionButton = await page.$(
      requestTransactionButtonSelector
    )
    requestTransactionButton.click()

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 })

    // redirect to historyScreen
    await expect(page.url()).toMatch('/requests')
  })
})
