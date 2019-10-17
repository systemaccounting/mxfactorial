const { SELECTORS, REQUEST_URL } = require('../../constants')

beforeAll(async () => {
  jest.setTimeout(30000)
  await page.goto(REQUEST_URL)
  await page.waitForSelector(SELECTORS.activeButton)
})

it('switches types', async () => {
  const rejectedButton = await page.$(SELECTORS.rejectedButton)
  const activeButtonStatus = await page.$eval(SELECTORS.activeButton, element =>
    element.getAttribute('data-active')
  )

  expect(activeButtonStatus).toBe('true')
  await rejectedButton.click()

  const activeButtonStatusAfterClick = await page.$eval(
    SELECTORS.activeButton,
    element => element.getAttribute('data-active')
  )
  const rejectedButtonStatusAfterClick = await page.$eval(
    SELECTORS.rejectedButton,
    element => element.getAttribute('data-active')
  )

  expect(activeButtonStatusAfterClick).toBe('false')
  expect(rejectedButtonStatusAfterClick).toBe('true')
})
