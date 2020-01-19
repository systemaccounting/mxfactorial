const { SELECTORS, REQUEST_URL } = require('../../constants')

describe('Requests screen inventory', () => {
  beforeAll(async () => {
    jest.setTimeout(30000)
    await page.goto(REQUEST_URL)
    await page.waitForSelector(SELECTORS.activeButton)
  })

  it('active button displays', async () => {
    const activeButton = await page.$$eval(
      SELECTORS.activeButton,
      list => list.length
    )
    expect(activeButton).toEqual(1)
  })

  it('rejected button displays', async () => {
    const rejectedButton = await page.$$eval(
      SELECTORS.rejectedButton,
      list => list.length
    )
    expect(rejectedButton).toEqual(1)
  })

  it('displays 20 most recent requestItemIndicator', async () => {
    const requestItemsLength = await page.$$eval(
      SELECTORS.requestItem,
      list => list.length
    )
    expect(requestItemsLength).toBeLessThanOrEqual(20)
  })
})
