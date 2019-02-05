const transactionAddButtonSelector = 'button[data-id="transaction"]'
const transactionAddNameSelector = 'input[name="transaction-add-name"]'
const transactionAddPriceSelector = 'input[name="transaction-add-price"]'
const transactionAddQuantitySelector = 'input[name="transaction-add-quantity"]'

const addTransaction = async (
  page,
  transaction = { name: 'test', price: '100', quantity: '2' },
  draft = false
) => {
  const { name, price, quantity } = transaction

  if (name) {
    const itemNameInput = await page.$(transactionAddNameSelector)
    await itemNameInput.type(name)
  }

  if (price) {
    const itemPriceInput = await page.$(transactionAddPriceSelector)
    await itemPriceInput.type(price)
    // Blur input to fire fetchRules() request
    await page.$eval(transactionAddPriceSelector, e => e.blur())
  }

  if (quantity) {
    const itemQuantityInput = await page.$(transactionAddQuantitySelector)
    await itemQuantityInput.type(quantity)
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

module.exports = {
  addTransaction,
  getTotal,
  milk,
  bread,
  honey
}
