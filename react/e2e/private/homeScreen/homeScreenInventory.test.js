const { getTotal } = require('./utils')
const { SELECTORS, HOME_URL } = require('../../constants')

beforeAll(async () => {
  jest.setTimeout(30000)
  await page.goto(HOME_URL)
  await page.waitForSelector(SELECTORS.HOME)
})

describe('homeScreen inventory', () => {
  it('request button displays', async () => {
    const requestButtonLength = await page.$$eval(
      SELECTORS.creditButton,
      list => list.length
    )
    expect(requestButtonLength).toEqual(1)
  })

  it('debit button displays', async () => {
    const debitButton = await page.$(SELECTORS.debitButton)
    await debitButton.click()

    const debitButtonLength = await page.$$eval(
      SELECTORS.debitButton,
      list => list.length
    )
    expect(debitButtonLength).toEqual(1)
  })

  it('1 account label displays', async () => {
    const accountLabel = await page.$eval(
      SELECTORS.accountLabel,
      element => element.innerHTML
    )
    const accountHandle = await page.$eval(
      SELECTORS.accountValue,
      element => element.innerHTML
    )
    expect(accountLabel).toEqual('account')
    expect(accountHandle).toEqual('JoeSmith')
  })

  it('1 balance displays', async () => {})

  it('1 recipient-account-input displays', async () => {
    const recipientAccountInput = await page.$$(SELECTORS.recipientInput)
    expect(recipientAccountInput).toHaveLength(1)
  })

  it('1 total displays', async () => {
    const totalLabel = await page.$eval(
      SELECTORS.totalLabel,
      element => element.innerHTML
    )

    expect(totalLabel).toEqual('total')
    expect(await getTotal()).toEqual(0)
  })

  it('debit and credit buttons display', async () => {
    const debitButton = await page.$$(SELECTORS.debitButton)
    const creditButton = await page.$$(SELECTORS.creditButton)
    expect(debitButton).toHaveLength(1)
    expect(creditButton).toHaveLength(1)
  })
})
