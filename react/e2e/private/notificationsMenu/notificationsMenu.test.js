const { SELECTORS, HOME_URL, TEST_ACCOUNTS } = require('../../constants')
const { login } = require('../../utils/auth')
const { addTransaction, getTotal, milk } = require('../homeScreen/utils')

beforeAll(async () => {
  jest.setTimeout(30000)
  await page.goto(HOME_URL)
  await page.waitForSelector(SELECTORS.HOME)
})

describe('Notifications menu', () => {
  it('should close menu when clicked elsewhere', async () => {
    const notificationBtn = await page.$(SELECTORS.notificationButton)
    notificationBtn.click()
    await page.waitForSelector(SELECTORS.notificationsMenu)
    expect(await page.$$(SELECTORS.notificationsMenu)).toHaveLength(1)

    await page.click(SELECTORS.homeButton)
    const notificationsMenu = await page.$$(SELECTORS.notificationsMenu)
    expect(notificationsMenu).toHaveLength(0)
  })

  it('should close menu on clear button click', async () => {
    const notificationBtn = await page.$(SELECTORS.notificationButton)
    notificationBtn.click()
    await page.waitForSelector(SELECTORS.notificationsMenu)
    expect(await page.$$(SELECTORS.notificationsMenu)).toHaveLength(1)

    await page.click(SELECTORS.notificationsClearBtn)
    const notificationsMenu = await page.$$(SELECTORS.notificationsMenu)
    expect(notificationsMenu).toHaveLength(0)
  })

  it('should receive pending notifications', async () => {
    // login as TEST_ACCOUNT_02 (TEST_ACCOUNTS[1])
    const page2 = await browser.newPage()
    await login(page2, TEST_ACCOUNTS[1], process.env.JEST_SECRET)

    await page2.waitForSelector(SELECTORS.notificationsCounter)
    const counterEl = await page2.$(SELECTORS.notificationsCounter)
    const beforeCounter = await page2.evaluate(
      element => (element ? parseInt(element.textContent, 10) : 0),
      counterEl
    )

    await login(page, TEST_ACCOUNTS[2], process.env.JEST_SECRET)
    await page.goto(HOME_URL)
    await page.waitForSelector(SELECTORS.HOME)
    await page.type(SELECTORS.recipient, TEST_ACCOUNTS[1])

    // select credit type transaction
    await page.click(SELECTORS.debitButton)

    // create request
    await addTransaction(page, {
      name: 'milk',
      price: '2',
      quantity: '2'
    })
    await getTotal()
    // request transacton
    await page.click(SELECTORS.requestDebitTransactionBtn)
    await page.waitForSelector(SELECTORS.activeButton, { timeout: 30000 })

    await page2.waitFor(1000)
    const afterCounter = await page2.evaluate(
      element => (element ? parseInt(element.textContent, 10) : 0),
      counterEl
    )

    // Notifications counter incremented
    expect(beforeCounter + 1).toBe(afterCounter)
  })
})
