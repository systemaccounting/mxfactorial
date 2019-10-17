const { SELECTORS, REQUEST_URL } = require('../../constants')

beforeAll(async () => {
  jest.setTimeout(30000)
  await page.goto(REQUEST_URL, { waitUntil: 'networkidle0' })
  await page.waitForSelector(SELECTORS.activeButton)
  // const el = await page.waitForSelector('.transactions-loaded')
  const link = await page.$(SELECTORS.requestItem)
  await link.click()
})

it('inventory', async () => {
  const backButton = await page.$$eval(
    SELECTORS.backButton,
    list => list.length
  )
  expect(backButton).toEqual(1)

  const emailCopyButton = await page.$$eval(
    SELECTORS.emailCopyButton,
    list => list.length
  )
  expect(emailCopyButton).toEqual(1)

  const requestingAccountIndicator = await page.$$eval(
    SELECTORS.requestingAccountIndicator,
    list => list.length
  )
  expect(requestingAccountIndicator).toEqual(1)

  const sumTransactionItemIndicator = await page.$$eval(
    SELECTORS.sumTransactionItemIndicator,
    list => list.length
  )
  expect(sumTransactionItemIndicator).toEqual(1)

  const requestTimeIndicator = await page.$$eval(
    SELECTORS.requestTimeIndicator,
    list => list.length
  )
  expect(requestTimeIndicator).toEqual(1)

  const expirationTimeIndicator = await page.$$eval(
    SELECTORS.expirationTimeIndicator,
    list => list.length
  )
  expect(expirationTimeIndicator).toEqual(1)

  const transactButton = await page.$$eval(
    SELECTORS.transactButton,
    list => list.length
  )
  expect(transactButton).toEqual(1)

  const rejectButton = await page.$$eval(
    SELECTORS.rejectButton,
    list => list.length
  )
  expect(rejectButton).toEqual(1)

  const transactionItemIndicator = await page.$$eval(
    SELECTORS.transactionItemIndicator,
    list => list.length
  )
  expect(transactionItemIndicator).toEqual(1)

  const transactionIdIndicator = await page.$$eval(
    SELECTORS.transactionIdIndicator,
    list => list.length
  )
  expect(transactionIdIndicator).toEqual(1)

  const ruleInstanceIdsIndicator = await page.$$eval(
    SELECTORS.ruleInstanceIdsIndicator,
    list => list.length
  )
  expect(ruleInstanceIdsIndicator).toEqual(1)

  const preTransactionBalanceIndicator = await page.$$eval(
    SELECTORS.preTransactionBalanceIndicator,
    list => list.length
  )
  expect(preTransactionBalanceIndicator).toEqual(1)
})
