const { addTransaction, getTotal, milk, bread, honey } = require('./utils')
const { HOME_URL, HOME_SELECTOR } = require('../../constants')

const transactionDeleteSelector = 'button[name="delete-transaction"]'
const transactionClearSelector = 'button[data-id="transaction-clear"]'

beforeAll(async () => {
  await page.goto(HOME_URL)
  await page.waitForSelector(HOME_SELECTOR)
})

afterAll(async () => {
  await page.reload()
})

const getInputByValue = async value =>
  await page.$$eval(`input[value="${value}"]`, element => element.length)

describe('transaction add remove (milk, honey, bread)', () => {
  it('adds three items', async () => {
    expect(await getTotal()).toEqual(0)

    await addTransaction(page, milk)
    expect(await getTotal()).toBeGreaterThanOrEqual(20)

    await addTransaction(page, honey)
    expect(await getTotal()).toBeGreaterThanOrEqual(60)

    await addTransaction(page, bread, true) // draft
    expect(await getTotal()).toBeGreaterThanOrEqual(80)
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
    const deleteButton = await page.$(transactionDeleteSelector)

    // delete milk
    await deleteButton.click()
    expect(await getTotal()).toBeGreaterThanOrEqual(60)

    expect(await getInputByValue('milk')).toEqual(0)
    expect(await getInputByValue('honey')).toEqual(1)
    expect(await getInputByValue('bread')).toEqual(1)
  })

  it('delete honey and check result', async () => {
    const deleteButton = await page.$(transactionDeleteSelector)
    // delete honey
    await deleteButton.click()
    expect(await getTotal()).toBeGreaterThanOrEqual(20)

    expect(await getInputByValue('milk')).toEqual(0)
    expect(await getInputByValue('honey')).toEqual(0)
    expect(await getInputByValue('bread')).toEqual(1)
  })

  it('clear draft transaction and check result', async () => {
    const deleteButton = await page.$(transactionClearSelector)

    // delete bread
    await deleteButton.click()

    await page.waitFor(1000)

    expect(await getInputByValue('milk')).toEqual(0)
    expect(await getInputByValue('honey')).toEqual(0)
    expect(await getInputByValue('bread')).toEqual(0)

    expect(await getTotal()).toEqual(0)
  })

  it('add milk again after deleting added items', async () => {
    await addTransaction(page, milk)
    expect(await getTotal()).toBeGreaterThanOrEqual(20)
    expect(await getInputByValue('milk')).toEqual(1)
  })

  it('delete milk again', async () => {
    const deleteButton = await page.$(transactionDeleteSelector)
    // delete milk
    await deleteButton.click()
    expect(await getTotal()).toEqual(0)
    expect(await getInputByValue('milk')).toEqual(0)
  })

  it('add honey again', async () => {
    await addTransaction(page, honey, true) // draft
    expect(await getTotal()).toBeGreaterThanOrEqual(40)
    expect(await getInputByValue('honey')).toEqual(1)
  })

  it('delele honey again', async () => {
    const deleteButton2 = await page.$(transactionClearSelector)
    // delete honey
    await deleteButton2.click()
    expect(await getTotal()).toEqual(0)
    expect(await getInputByValue('honey')).toEqual(0)
  })

  it('default quantity=1 for user-generated items', async () => {
    await addTransaction(page, { name: 'test', price: 1 }, true) // draft
    expect(await getTotal()).toBeGreaterThanOrEqual(1)
  })
})
