const { sendRequest, approveRequest } = require('./utils')
const {
  SELECTORS,
  HOME_URL,
  REQUEST_URL,
  TEST_ACCOUNTS
} = require('../../constants')

describe('Approve request', () => {
  beforeAll(async () => {
    jest.setTimeout(30000)
    await page.goto(HOME_URL)
    await page.waitForSelector(SELECTORS.HOME)
  })

  afterAll(async () => {
    await login(page, TEST_ACCOUNTS[0], process.env.JEST_SECRET)
  })

  it('debitor_approval_time added to debit request record', async () => {
    const requestId = await sendRequest(
      TEST_ACCOUNTS[0],
      TEST_ACCOUNTS[1],
      'debit'
    )
    await approveRequest(TEST_ACCOUNTS[1], requestId)
    await page.waitForSelector(SELECTORS.historyItemIndicator)
    const historyItem = await page.$(SELECTORS.historyItemIndicator)
    const transactionId = await page.evaluate(
      el => el.getAttribute('data-transaction-id'),
      historyItem
    )
    // Approved transaction appears in history transactions list
    expect(requestId).toBe(transactionId)
  })

  it('creditor_approval_time added to credit request record', async () => {
    const requestId = await sendRequest(
      TEST_ACCOUNTS[0],
      TEST_ACCOUNTS[1],
      'credit'
    )
    await approveRequest(TEST_ACCOUNTS[1], requestId)
    await page.waitForSelector(SELECTORS.historyItemIndicator)
    const historyItem = await page.$(SELECTORS.historyItemIndicator)
    const transactionId = await page.evaluate(
      el => el.getAttribute('data-transaction-id'),
      historyItem
    )
    // Approved transaction appears in history transactions list
    expect(requestId).toBe(transactionId)
  })
})
