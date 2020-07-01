const { addTransaction, milk, honey } = require('./utils')
const { SELECTORS, BASE_URL, HOME_URL } = require('../../constants')

beforeAll(async () => {
  jest.setTimeout(30000)
  await page.goto(HOME_URL)
  await page.waitForSelector(SELECTORS.HOME)
})

const getInputByValue = async value =>
  await page.$$eval(`input[value="${value}"]`, element => element.length)

describe('form visibility after transaction deletion', () => {
  it('adds milk and draft honey', async () => {
    await addTransaction(page, milk)
    await addTransaction(page, honey, true)
  })

  it('clear form (honey)', async () => {
    const [_, clearBtn2] = await page.$$(SELECTORS.transactionClear)
    await clearBtn2.click()
    expect(await getInputByValue('honey')).toEqual(0) // honey is cleared

    const toggleButton = await page.$$(SELECTORS.transactionFormToggle)
    expect(toggleButton).toHaveLength(0)
  })

  it('remove milk', async () => {
    const deleteButton = await page.$(SELECTORS.transactionDelete)
    await deleteButton.click()
    const toggleButton = await page.$$(SELECTORS.transactionFormToggle)
    expect(toggleButton).toHaveLength(0)
  })
})
