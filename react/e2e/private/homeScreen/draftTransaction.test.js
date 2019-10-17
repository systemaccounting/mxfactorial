const { addTransaction, getTotal, milk, bread, honey } = require('./utils')
const { SELECTORS, HOME_URL } = require('../../constants')

beforeAll(async () => {
  jest.setTimeout(30000)
  await page.goto(HOME_URL)
  await page.waitForSelector(SELECTORS.HOME)
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
      SELECTORS.transactionAddName,
      element => element.value
    )
    expect(nameInputValue).toEqual(honey.name)

    const priceInputValue = await page.$eval(
      SELECTORS.transactionAddPrice,
      element => element.value
    )
    expect(priceInputValue).toEqual(honey.price)

    const quantityInputValue = await page.$eval(
      SELECTORS.transactionAddQuantity,
      element => element.value
    )
    expect(quantityInputValue).toEqual(honey.quantity)
  })

  it('draft transaction gets cleared and form remains', async () => {
    const clearButton = await page.$(SELECTORS.transactionClear)
    await clearButton.click()

    total = milk.price * milk.quantity
    expect(await getTotal()).toBeGreaterThanOrEqual(total)

    const nameInputValue = await page.$eval(
      SELECTORS.transactionAddName,
      element => element.value
    )
    expect(nameInputValue).toEqual('')

    const priceInputValue = await page.$eval(
      SELECTORS.transactionAddPrice,
      element => element.value
    )
    expect(priceInputValue).toEqual('')

    const quantityInputValue = await page.$eval(
      SELECTORS.transactionAddQuantity,
      element => element.value
    )
    expect(quantityInputValue).toEqual('')
  })
})
