const { REQUEST_URL } = require('../../constants')

const activeButtonSelector = 'button[data-id="activeButton"]'
const rejectedButtonSelector = 'button[data-id="rejectedButton"]'

beforeAll(async () => {
  await page.goto(REQUEST_URL)
  await page.waitForSelector(activeButtonSelector)
})

it('active button displays', async () => {
  const activeButton = await page.$$eval(
    activeButtonSelector,
    list => list.length
  )
  expect(activeButton).toEqual(1)
})

it('rejected button displays', async () => {
  const rejectedButton = await page.$$eval(
    rejectedButtonSelector,
    list => list.length
  )
  expect(rejectedButton).toEqual(1)
})
