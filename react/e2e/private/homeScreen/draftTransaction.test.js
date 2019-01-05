const { addTransaction, getTotal, milk, bread, honey } = require('./utils')
const { HOME_URL, HOME_SELECTOR } = require('../../constants')

const transactionClearSelector = 'button[data-id="transaction-clear"]'
const transactionAddNameSelector = 'input[name="transaction-add-name"]'
const transactionAddPriceSelector = 'input[name="transaction-add-price"]'
const transactionAddQuantitySelector = 'input[name="transaction-add-quantity"]'

beforeAll(async () => {
  await page.goto(HOME_URL)
  await page.waitForSelector(HOME_SELECTOR)
})

let total = 0

describe('transaction add remove (milk, honey, bread)', () => {
  it('add 1 transaction and 1 draft transaction', async () => {
    expect(await getTotal()).toEqual(total)

    await addTransaction(page, milk)
    total += milk.price * milk.quantity
    expect(await getTotal()).toBeGreaterThanOrEqual(total)

    await addTransaction(page, honey, true) //draft
    total += honey.price * honey.quantity
    expect(await getTotal()).toBeGreaterThanOrEqual(total)
  })

  it('draft transaction input values', async () => {
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
  })

  it('draft transaction gets cleared and form remains', async () => {
    const clearButton = await page.$(transactionClearSelector)
    await clearButton.click()

    total = milk.price * milk.quantity
    expect(await getTotal()).toBeGreaterThanOrEqual(total)

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
  })
})
