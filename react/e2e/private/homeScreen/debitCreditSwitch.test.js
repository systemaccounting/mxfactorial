const { HOME_URL, HOME_SELECTOR } = require('../../constants')

const creditSelector = 'button[name="credit"]'
const debitSelector = 'button[name="debit"]'

beforeAll(async () => {
  await page.goto(HOME_URL)
  await page.waitForSelector(HOME_SELECTOR)
})

it('switches between debit and credit', async () => {
  const debitButtonActive = await page.$eval(debitSelector, element =>
    element.getAttribute('data-active')
  )
  expect(debitButtonActive).toEqual('false')

  const creditButtonActive = await page.$eval(creditSelector, element =>
    element.getAttribute('data-active')
  )
  expect(creditButtonActive).toEqual('true')

  const debitButton = await page.$(debitSelector)
  await debitButton.click()

  const creditButtonActive2 = await page.$eval(creditSelector, element =>
    element.getAttribute('data-active')
  )
  expect(creditButtonActive2).toEqual('false')

  const debitButtonActive2 = await page.$eval(debitSelector, element =>
    element.getAttribute('data-active')
  )
  expect(debitButtonActive2).toEqual('true')

  const creditButton = await page.$(creditSelector)
  await creditButton.click()

  const creditButtonActive3 = await page.$eval(creditSelector, element =>
    element.getAttribute('data-active')
  )
  expect(creditButtonActive3).toEqual('true')

  const debitButtonActive3 = await page.$eval(debitSelector, element =>
    element.getAttribute('data-active')
  )
  expect(debitButtonActive3).toEqual('false')
})
