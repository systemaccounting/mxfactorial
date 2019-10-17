const { SELECTORS, HOME_URL } = require('../../constants')

beforeAll(async () => {
  jest.setTimeout(30000)
  await page.goto(HOME_URL)
  await page.waitForSelector(SELECTORS.HOME)
})

it('switches between debit and credit', async () => {
  const debitButtonActive = await page.$eval(SELECTORS.debitButton, element =>
    element.getAttribute('data-active')
  )
  expect(debitButtonActive).toEqual('false')

  const creditButtonActive = await page.$eval(SELECTORS.creditButton, element =>
    element.getAttribute('data-active')
  )
  expect(creditButtonActive).toEqual('true')

  const debitButton = await page.$(SELECTORS.debitButton)
  await debitButton.click()

  const creditButtonActive2 = await page.$eval(
    SELECTORS.creditButton,
    element => element.getAttribute('data-active')
  )
  expect(creditButtonActive2).toEqual('false')

  const debitButtonActive2 = await page.$eval(SELECTORS.debitButton, element =>
    element.getAttribute('data-active')
  )
  expect(debitButtonActive2).toEqual('true')

  const creditButton = await page.$(SELECTORS.creditButton)
  await creditButton.click()

  const creditButtonActive3 = await page.$eval(
    SELECTORS.creditButton,
    element => element.getAttribute('data-active')
  )
  expect(creditButtonActive3).toEqual('true')

  const debitButtonActive3 = await page.$eval(SELECTORS.debitButton, element =>
    element.getAttribute('data-active')
  )
  expect(debitButtonActive3).toEqual('false')
})
