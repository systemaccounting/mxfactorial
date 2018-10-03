const puppeteer = require('puppeteer')
const login = require('../utils/login')
const { addTransaction } = require('./utils')

const { BASE_URL, HOME_URL, HOME_SELECTOR } = require('../constants')

let browser
let page

beforeAll(async () => {
  browser = await puppeteer.launch({
    args: ['--no-sandbox']
  })

  page = await browser.newPage()
  await page.goto(BASE_URL)
  page = await login(page)

  await page.setViewport({ height: 500, width: 400 })
  await page.goto(HOME_URL)
  await page.waitForSelector(HOME_SELECTOR)
})

afterAll(async () => {
  browser.close()
})

test(
  'selecting add-item button scrolls window down',
  async () => {
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
    ).toBeGreaterThanOrEqual(100)
  },
  20000
)
