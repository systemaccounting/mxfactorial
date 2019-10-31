const { addTransaction, honey } = require('./utils')
const { SELECTORS, TEST_ACCOUNTS, HOME_URL } = require('../../constants')

beforeAll(async () => {
  jest.setTimeout(30000)
  await page.goto(HOME_URL)
  await page.waitForSelector(SELECTORS.HOME)
})

describe('request performace', () => {
  // lambda cold start test result before relocating rules outside vpc: 17921 ms
  // lambda cold start test result after relocating rules outside vpc: 6013 ms
  // warm lambda test result: 2199 ms
  it('requests transaction in under 8 seconds', async () => {
    await page.type(SELECTORS.recipient, TEST_ACCOUNTS[1])
    await addTransaction(page, honey)
    // Select credit type transaction
    let creditButton = await page.$(SELECTORS.creditButton)
    await creditButton.click()
    // wait for rule
    await page.waitForSelector(SELECTORS.ruleItem)
    // Request transacton
    await page.click(SELECTORS.requestCreditTransactionBtn)
    let startTime = Date.now()
    // await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
    await page.waitForSelector(SELECTORS.requestItem)
    let endTime = Date.now()
    let duration = endTime - startTime
    console.log(duration)
    expect(duration).toBeLessThan(8000)
  })
})
