const { addTransaction, getTotal, milk, bread, honey } = require('./utils')
const { SELECTORS, HOME_URL } = require('../../constants')

beforeAll(async () => {
  jest.setTimeout(30000)
  await page.goto(HOME_URL)
  await page.waitForSelector(SELECTORS.HOME)
})

afterAll(async () => {
  await page.reload()
})

const getInputByValue = async value =>
  await page.$$eval(`input[value="${value}"]`, element => element.length)

describe('transaction add remove (milk, honey, bread)', () => {
  it('adds three items', async () => {
    await page.waitFor(500)
    expect(await getTotal()).toEqual(0)

    await addTransaction(page, milk)
    // 20 + 9%
    expect(await getTotal()).toEqual(21.8)

    await addTransaction(page, honey)
    // 60 + 9%
    expect(await getTotal()).toEqual(65.4)

    await addTransaction(page, bread, true) // draft
    // 80 + 9%
    expect(await getTotal()).toEqual(87.2)
  })

  it('item names should be corect', async () => {
    expect(await getInputByValue('milk')).toEqual(1)
    expect(await getInputByValue('honey')).toEqual(1)
    expect(await getInputByValue('bread')).toEqual(1)
  })

  it('user-generated item sequence contains 0 rule-generated items', async () => {
    const qty = await page.$$eval(
      '[data-id="user-generated-items"] [data-id="rule-item"]',
      list => list.length
    )

    expect(qty).toEqual(0)
  })

  it('rule-generated item sequence contains 0 user-generated items', async () => {
    const qty = await page.$$eval(
      '[data-id="transaction-rules"] [data-id="user-item"]',
      list => list.length
    )

    expect(qty).toEqual(0)
  })

  it('delete milk and check result', async () => {
    const deleteButton = await page.$(SELECTORS.transactionDelete)

    // delete milk
    await deleteButton.click()
    await page.waitFor(500)
    expect(await getTotal()).toEqual(65.4)
    await page.waitFor(500)
    expect(await getInputByValue('milk')).toEqual(0)
    await page.waitFor(500)
    expect(await getInputByValue('honey')).toEqual(1)
    await page.waitFor(500)
    expect(await getInputByValue('bread')).toEqual(1)
  })

  it('delete honey and check result', async () => {
    const deleteButton = await page.$(SELECTORS.transactionDelete)
    // delete honey
    await deleteButton.click()
    expect(await getTotal()).toEqual(21.8)

    expect(await getInputByValue('milk')).toEqual(0)
    expect(await getInputByValue('honey')).toEqual(0)
    expect(await getInputByValue('bread')).toEqual(1)
  })

  it('clear draft transaction and check result', async () => {
    const deleteButton = await page.$(SELECTORS.transactionDelete)

    // delete bread
    await deleteButton.click()

    expect(await getInputByValue('milk')).toEqual(0)
    expect(await getInputByValue('honey')).toEqual(0)
    expect(await getInputByValue('bread')).toEqual(0)

    expect(await getTotal()).toEqual(0)
  })

  it('add milk again after deleting added items', async () => {
    await addTransaction(page, milk)
    expect(await getTotal()).toEqual(21.8)
    expect(await getInputByValue('milk')).toEqual(1)
  })

  it('delete milk again', async () => {
    const deleteButton = await page.$(SELECTORS.transactionDelete)
    // delete milk
    await deleteButton.click()
    expect(await getTotal()).toEqual(0)
    expect(await getInputByValue('milk')).toEqual(0)
  })

  it('add honey again', async () => {
    await addTransaction(page, honey, true) // draft
    expect(await getTotal()).toEqual(43.6)
    expect(await getInputByValue('honey')).toEqual(1)
  })

  it('delele honey again', async () => {
    const deleteButton2 = await page.$(SELECTORS.transactionDelete)
    // delete honey
    await deleteButton2.click()
    expect(await getTotal()).toEqual(0)
    expect(await getInputByValue('honey')).toEqual(0)
  })

  it('default quantity=1 for user-generated items', async () => {
    await addTransaction(page, { name: 'test', price: '1' }, true) // draft
    expect(await getTotal()).toEqual(1.09)
    const deleteButton = await page.$(SELECTORS.transactionDelete)
    // delete draft transaction
    await deleteButton.click()
  })

  it('instantly updates total value on delete transaction', async () => {
    await addTransaction(page, milk)
    await addTransaction(page, honey)
    await addTransaction(page, bread)

    const deleteMilkButton = await page.$(SELECTORS.transactionDelete)
    await deleteMilkButton.click()
    expect(await getTotal(false)).toEqual(65.4)

    const deleteHoneyButton = await page.$(SELECTORS.transactionDelete)
    await deleteHoneyButton.click()
    expect(await getTotal(false)).toEqual(21.8)

    const deleteBreadButton = await page.$(SELECTORS.transactionDelete)
    await deleteBreadButton.click()
    expect(await getTotal(false)).toEqual(0)
  })

  it('displays .toFixed(3) total value', async () => {
    await addTransaction(page, { name: 'milk', price: '2.00', quantity: '3' })
    await addTransaction(page, { name: 'honey', price: '4', quantity: '4' })
    await addTransaction(page, { name: 'pasta', price: '5', quantity: '5' })
    await page.waitFor(500)
    expect(await getTotal()).toEqual(51.23)
  })
})
