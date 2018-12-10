const { REQUEST_URL } = require('../../constants')

const activeButtonSelector = 'button[data-id="activeButton"]'
const rejectedButtonSelector = 'button[data-id="rejectedButton"]'

const selectors = {
  backButton: '[data-id="backButton"]',
  emailCopyButton: '[data-id="emailCopyButton"]',
  requestingAccountIndicator: '[data-id="requestingAccountIndicator"]',
  sumTransactionItemIndicator: '[data-id="sumTransactionItemIndicator"]',
  requestTimeIndicator: '[data-id="requestTimeIndicator"]',
  expirationTimeIndicator: '[data-id="expirationTimeIndicator"]',
  transactButton: '[data-id="transactButton"]',
  rejectButton: '[data-id="rejectButton"]',
  transactionItemIndicator: '[data-id="transactionItemIndicator"]',
  transactionIdIndicator: '[data-id="transactionIdIndicator"]',
  ruleInstanceIdsIndicator: '[data-id="ruleInstanceIdsIndicator"]',
  preTransactionBalanceIndicator: '[data-id="preTransactionBalanceIndicator"]'
}

beforeAll(async () => {
  await page.goto(REQUEST_URL)
  await page.waitForSelector(activeButtonSelector)
  const link = await page.$('[data-id="requestItemIndicator"]')
  await link.click()
})

it('inventory', async () => {
  const backButton = await page.$$eval(
    selectors.backButton,
    list => list.length
  )
  expect(backButton).toEqual(1)

  const emailCopyButton = await page.$$eval(
    selectors.emailCopyButton,
    list => list.length
  )
  expect(emailCopyButton).toEqual(1)

  const requestingAccountIndicator = await page.$$eval(
    selectors.requestingAccountIndicator,
    list => list.length
  )
  expect(requestingAccountIndicator).toEqual(1)

  const sumTransactionItemIndicator = await page.$$eval(
    selectors.sumTransactionItemIndicator,
    list => list.length
  )
  expect(sumTransactionItemIndicator).toEqual(1)

  const requestTimeIndicator = await page.$$eval(
    selectors.requestTimeIndicator,
    list => list.length
  )
  expect(requestTimeIndicator).toEqual(1)

  const expirationTimeIndicator = await page.$$eval(
    selectors.expirationTimeIndicator,
    list => list.length
  )
  expect(expirationTimeIndicator).toEqual(1)

  const transactButton = await page.$$eval(
    selectors.transactButton,
    list => list.length
  )
  expect(transactButton).toEqual(1)

  const rejectButton = await page.$$eval(
    selectors.rejectButton,
    list => list.length
  )
  expect(rejectButton).toEqual(1)

  const transactionItemIndicator = await page.$$eval(
    selectors.transactionItemIndicator,
    list => list.length
  )
  expect(transactionItemIndicator).toEqual(1)

  const transactionIdIndicator = await page.$$eval(
    selectors.transactionIdIndicator,
    list => list.length
  )
  expect(transactionIdIndicator).toEqual(1)

  const ruleInstanceIdsIndicator = await page.$$eval(
    selectors.ruleInstanceIdsIndicator,
    list => list.length
  )
  expect(ruleInstanceIdsIndicator).toEqual(1)

  const preTransactionBalanceIndicator = await page.$$eval(
    selectors.preTransactionBalanceIndicator,
    list => list.length
  )
  expect(preTransactionBalanceIndicator).toEqual(1)
})
