const { login } = require('../../utils/auth')

const { SELECTORS, REQUEST_URL } = require('../../constants')

const transactionAddButtonSelector = 'button[data-id="transaction-add"]'
const transactionAddNameSelector = 'input[data-id="transaction-add-name"]'
const transactionAddPriceSelector = 'input[data-id="transaction-add-price"]'
const transactionAddQuantitySelector =
  'input[data-id="transaction-add-quantity"]'

const addTransaction = async (
  page,
  transaction = { name: 'test', price: '100', quantity: '2' },
  draft = false
) => {
  const { name, price, quantity } = transaction

  if (name) {
    await page.type(transactionAddNameSelector, name)
  }

  if (price) {
    await page.type(transactionAddPriceSelector, price)
    // Blur input to fire fetchRules() request
    await page.$eval(transactionAddPriceSelector, e => e.blur())
  }

  if (quantity) {
    await page.type(transactionAddQuantitySelector, quantity)
    // Blur input to fire fetchRules() request
    await page.$eval(transactionAddQuantitySelector, e => e.blur())
  }

  if (!draft) {
    const addItemButton = await page.$(transactionAddButtonSelector)
    await addItemButton.click()
  }
}

/**
 * Get total transactions value
 * @param waitUntilFetched Wait until fetchRules() completed
 * @returns {Promise<void>}
 */
const getTotal = async (waitUntilFetched = true) => {
  if (waitUntilFetched) {
    await page.waitForSelector('.updated')
  }
  return await page.$eval('[name="total-value"]', element =>
    parseFloat(element.innerHTML)
  )
}

const milk = {
  name: 'milk',
  price: '10',
  quantity: '2'
}
const honey = {
  name: 'honey',
  price: '40',
  quantity: '1'
}
const bread = {
  name: 'bread',
  price: '2',
  quantity: '10'
}

const sendRequest = async (sender, receiver, type = 'credit') => {
  await login(page, sender, process.env.JEST_SECRET)

  // await page.waitForSelector(SELECTORS.HOME)
  await page.type(SELECTORS.recipient, receiver)

  const requestTypeBtn = await page.$(
    type === 'credit' ? SELECTORS.creditButton : SELECTORS.debitButton
  )
  await requestTypeBtn.click()

  await addTransaction(page, milk)
  await addTransaction(page, honey)
  await addTransaction(page, bread)
  await getTotal()

  // request transacton
  await page.click(
    type === 'credit'
      ? SELECTORS.requestCreditTransactionBtn
      : SELECTORS.requestDebitTransactionBtn
  )
  await page.waitForSelector(SELECTORS.requestItem)
  const requestItems = await page.$(SELECTORS.requestItem)
  // get the most recent request id
  const requestId = await page.evaluate(
    el => el.getAttribute('data-request-id'),
    requestItems
  )
  return requestId
}

const approveRequest = async (receiver, requestId) => {
  await login(page, receiver, process.env.JEST_SECRET)
  await page.goto(`${REQUEST_URL}/${requestId}`)
  await page.waitForSelector(SELECTORS.requestingAccountIndicator)
  await page.click(SELECTORS.transactButton)
  await page.waitForSelector(SELECTORS.approveModal)
  await page.type(SELECTORS.modalPasswordInput, process.env.JEST_SECRET)
  await page.waitFor(1000)
  await page.click(SELECTORS.okButton)
  await page.waitForSelector(SELECTORS.successModal)
  await page.waitForSelector(SELECTORS.okButton)
  await page.click(SELECTORS.okButton)
}

module.exports = {
  sendRequest,
  approveRequest,
  addTransaction,
  getTotal,
  milk,
  bread,
  honey
}
