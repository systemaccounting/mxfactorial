const { SELECTORS, REQUEST_URL } = require('../../constants')

beforeAll(async () => {
  jest.setTimeout(30000)
  await page.goto(REQUEST_URL, { waitUntil: 'networkidle0' })
  await page.waitForSelector(SELECTORS.activeButton)
  const link = await page.$(SELECTORS.requestItem)
  await link.click()
})

const getApproveModalStatus = async () =>
  await page.$eval(SELECTORS.approveModal, element =>
    element.getAttribute('data-open')
  )

it('1 - open/close passwordApproveTransaction Modal', async () => {
  const transactBtn = await page.$(SELECTORS.transactButton)
  await transactBtn.click()
  await page.waitFor(1000)

  expect(await getApproveModalStatus()).toEqual('true')

  const cancelButton = await page.$(SELECTORS.cancelButton)
  await cancelButton.click()
  expect(await getApproveModalStatus()).toEqual('false')
})

it('2 - password error', async () => {
  await page.goto(REQUEST_URL, { waitUntil: 'networkidle0' })
  await page.waitForSelector(SELECTORS.activeButton)
  const link = await page.$(SELECTORS.requestItem)
  await link.click()

  const transactBtn = await page.$(SELECTORS.transactButton)
  await transactBtn.click()
  expect(await getApproveModalStatus()).toEqual('true')
  await page.waitFor(1000)
  const passwordInput = await page.$(SELECTORS.modalPasswordInput)
  await passwordInput.type('FALSE')
  const okButton = await page.$(SELECTORS.okButton)
  await okButton.click()

  await page.waitForSelector(
    `${SELECTORS.modalPasswordInput}[data-haserror=true]`
  )
  const hasError = await page.$eval(SELECTORS.modalPasswordInput, element =>
    element.getAttribute('data-haserror')
  )
  expect(hasError).toEqual('true')
})

it('3 - remove error password on pasword input update', async () => {
  const passwordInput = await page.$(SELECTORS.modalPasswordInput)
  await passwordInput.type('X')

  const hasError = await page.$eval(SELECTORS.modalPasswordInput, element =>
    element.getAttribute('data-haserror')
  )
  // await page.waitFor(1500)
  expect(hasError).toEqual('false')
})
