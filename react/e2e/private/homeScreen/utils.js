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
  }

  if (quantity) {
    const itemQuantityInput = await page.$(transactionAddQuantitySelector)
    await itemQuantityInput.type(quantity)
  }

  if (!draft) {
    const addItemButton = await page.$(transactionAddButtonSelector)
    await addItemButton.click()
  }
}

const getTotal = async () =>
  await page.$eval('[name="total-value"]', element =>
    parseFloat(element.innerHTML)
  )

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
