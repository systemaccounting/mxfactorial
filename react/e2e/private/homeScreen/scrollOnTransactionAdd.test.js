const { addTransaction } = require('./utils')

const { SELECTORS, HOME_URL } = require('../../constants')

beforeAll(async () => {
  jest.setTimeout(30000)
  await page.setViewport({ height: 500, width: 400 })
  await page.goto(HOME_URL)
  await page.waitForSelector(SELECTORS.HOME)
})

describe('scroll home screen on add item', () => {
  it('selecting add-item button scrolls window down', async () => {
    const draftTransaction = await page.$('[data-id="draft-transaction"]')

    await addTransaction(page)
    expect(await draftTransaction.isIntersectingViewport()).toBe(true)

    await addTransaction(page)
    expect(await draftTransaction.isIntersectingViewport()).toBe(true)

    await addTransaction(page)
    expect(await draftTransaction.isIntersectingViewport()).toBe(true)

    await addTransaction(page)
    expect(await draftTransaction.isIntersectingViewport()).toBe(true)
  })
})
