const { HOME_URL, HOME_SELECTOR } = require('../../constants')

const creditSelector = 'button[name="credit"]'
const debitSelector = 'button[name="debit"]'
const totalValueSelector = '[name="total-value"]'
const totalLabelSelector = '[name="total-label"]'
const accountLabelSelector = '[name="account-label"]'
const accountValueSelector = '[name="account-value"]'
const recipientInputSelector = 'input[name="recipient"]'
const balanceSelector = '[placeholder="balance"]'

beforeAll(async () => {
  await page.goto(HOME_URL)
  await page.waitForSelector(HOME_SELECTOR)
})

it('request button displays', async () => {
  const requestButtonLength = await page.$$eval(
    creditSelector,
    list => list.length
  )
  expect(requestButtonLength).toEqual(1)
})

it('debit button displays', async () => {
  const debitButton = await page.$(debitSelector)
  await debitButton.click()

  const debitButtonLength = await page.$$eval(
    debitSelector,
    list => list.length
  )
  expect(debitButtonLength).toEqual(1)
})

it('1 account label displays', async () => {
  const accountLabel = await page.$eval(
    accountLabelSelector,
    element => element.innerHTML
  )
  const accountHandle = await page.$eval(
    accountValueSelector,
    element => element.innerHTML
  )
  expect(accountLabel).toEqual('account')
  expect(accountHandle).toEqual('JoeSmith')
})

it('1 balance displays', async () => {
  const balanceLabel = await page.$$(balanceSelector)
  expect(balanceLabel).toHaveLength(1)
})

it('1 recipient-account-input displays', async () => {
  const recipientAccountInput = await page.$$(recipientInputSelector)
  expect(recipientAccountInput).toHaveLength(1)
})

it('1 total displays', async () => {
  const totalLabel = await page.$eval(
    totalLabelSelector,
    element => element.innerHTML
  )

  const total = await page.$eval(
    totalValueSelector,
    element => element.innerHTML
  )

  expect(totalLabel).toEqual('total')
  expect(total).toEqual('0')
})

it('debit and credit buttons display', async () => {
  const debitButton = await page.$$(debitSelector)
  const creditButton = await page.$$(creditSelector)
  expect(debitButton).toHaveLength(1)
  expect(creditButton).toHaveLength(1)
})
