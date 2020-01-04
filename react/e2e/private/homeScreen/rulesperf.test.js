const { addTransaction, milk } = require('./utils')
const { SELECTORS, HOME_URL } = require('../../constants')

beforeAll(async () => {
  jest.setTimeout(30000)
  await page.goto(HOME_URL)
  await page.waitForSelector(SELECTORS.HOME)
})

describe('rules performance', () => {
  // lambda cold start test result before relocating rules outside vpc: 11887 ms
  // lambda cold start test result after relocating rules outside vpc: 2852 ms
  // warm lambda test result: 248 ms
  it('displays rule-generated item in under 5 seconds', async () => {
    await addTransaction(page, milk)
    let startTime = Date.now()
    await page.waitForSelector(SELECTORS.ruleItem)
    let endTime = Date.now()
    let duration = endTime - startTime
    // console.log(duration)
    expect(duration).toBeLessThan(5000)
  })
})
