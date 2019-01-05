const { addTransaction } = require('./utils')

const { BASE_URL, HOME_URL, HOME_SELECTOR } = require('../../constants')

beforeAll(async () => {
  await page.setViewport({ height: 500, width: 400 })
  await page.goto(HOME_URL)
  await page.waitForSelector(HOME_SELECTOR)
})

describe('scroll home screen on add item', () => {
  it('selecting add-item button scrolls window down', async () => {
    let yScrollDiffs = []
    const position0 = await page.evaluate(() => window.scrollY)
    await addTransaction(page)
    const position1 = await page.evaluate(() => window.scrollY)
    yScrollDiffs.push(position1 - position0)
    await addTransaction(page)
    const position2 = await page.evaluate(() => window.scrollY)
    yScrollDiffs.push(position2 - position1)
    await addTransaction(page)
    const position3 = await page.evaluate(() => window.scrollY)
    yScrollDiffs.push(position3 - position2)
    await addTransaction(page)
    const position4 = await page.evaluate(() => window.scrollY)
    yScrollDiffs.push(position4 - position3)
    const inconsistencyTest = yScrollDiffs.filter(diff => {
      return diff !== yScrollDiffs[0]
    })
    expect(
      yScrollDiffs[yScrollDiffs.length - 1] - yScrollDiffs[0]
    ).toBeGreaterThanOrEqual(70)
  })
})
