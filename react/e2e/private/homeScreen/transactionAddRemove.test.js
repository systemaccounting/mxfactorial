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
    expect(await getTotal()).not.toBeLessThan(20)

    await addTransaction(page, honey)
    expect(await getTotal()).not.toBeLessThan(60)

    await addTransaction(page, bread, true) // draft
    expect(await getTotal()).not.toBeLessThan(80)
  })

  it('item names should be corect', async () => {
    expect(await getInputByValue('milk')).toEqual(1)
    expect(await getInputByValue('honey')).toEqual(1)
    expect(await getInputByValue('bread')).toEqual(1)
  })

  it('delete milk and check result', async () => {
    const deleteButton = await page.$(transactionDeleteSelector)

    // delete milk
    await deleteButton.click()
    expect(await getTotal()).not.toBeLessThan(60)

    expect(await getInputByValue('milk')).toEqual(0)
    expect(await getInputByValue('honey')).toEqual(1)
    expect(await getInputByValue('bread')).toEqual(1)
  })

  it('delete honey and check result', async () => {
    const deleteButton = await page.$(transactionDeleteSelector)
    // delete honey
    await deleteButton.click()
    expect(await getTotal()).not.toBeLessThan(20)

    expect(await getInputByValue('milk')).toEqual(0)
    expect(await getInputByValue('honey')).toEqual(0)
    expect(await getInputByValue('bread')).toEqual(1)
  })

  it('clear draft transaction and check result', async () => {
    const deleteButton = await page.$(transactionClearSelector)

    // delete bread
    await deleteButton.click()

    expect(await getInputByValue('milk')).toEqual(0)
    expect(await getInputByValue('honey')).toEqual(0)
    expect(await getInputByValue('bread')).toEqual(0)

    await page.waitFor(2000)
    expect(await getTotal()).toEqual(0)
  })

  it('add milk again after deleting added items', async () => {
    await addTransaction(page, milk)
    expect(await getTotal()).not.toBeLessThan(20)
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
    expect(await getTotal()).not.toBeLessThan(40)
    expect(await getInputByValue('honey')).toEqual(1)
  })

  it('delele honey again', async () => {
    const deleteButton2 = await page.$(transactionClearSelector)
    // delete honey
    await deleteButton2.click()
    expect(await getTotal()).toEqual(0)
    expect(await getInputByValue('honey')).toEqual(0)
  })
})
