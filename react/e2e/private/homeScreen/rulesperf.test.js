const { addTransaction, milk } = require('./utils')
const { SELECTORS, HOME_URL } = require('../../constants')

beforeAll(async () => {
  jest.setTimeout(30000)
  await page.goto(HOME_URL)
  await page.waitForSelector(SELECTORS.HOME)
})

describe('rules performace', () => {
  // lambda cold start test result: 11887 ms
  // warm lambda test result: 248 ms
  it('displays rule-generated item in under 15 seconds', async () => {
    await addTransaction(page, milk)
    let startTime = Date.now()
    await page.waitForSelector(SELECTORS.ruleItem)
    let endTime = Date.now()
    let duration = endTime - startTime
    // console.log(duration)
    expect(duration).toBeLessThan(15000)
  })
})
