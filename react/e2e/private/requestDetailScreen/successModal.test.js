const { REQUEST_URL, HOME_URL } = require('../../constants')

const activeButtonSelector = 'button[data-id="activeButton"]'

const selectors = {
  requestItem: '[data-id="requestItemIndicator"]',
  backButton: '[data-id="backButton"]',
  approveModal: '[data-id=passwordApproveTransactionPopUp]',
  successModal: '[data-id=transactionSuccessPopup]',
  transactButton: '[data-id="transactButton"]',
  cancelButton: '[data-id="cancelButton"]',
  okButton: '[data-id="okButton"]',
  newButton: '[data-id="newButton"]',
  passwordInput: '[data-id="passwordInputField"]'
}

beforeAll(async () => {
  await page.goto(REQUEST_URL, { waitUntil: 'networkidle0' })
  await page.waitForSelector(activeButtonSelector)
  const link = await page.$(selectors.requestItem)
  await link.click()
})

const getApproveModalStatus = async () =>
  await page.$eval(selectors.approveModal, element =>
    element.getAttribute('data-open')
  )

it('1 - show success modal', async () => {
  const transactBtn = await page.$(selectors.transactButton)
  await transactBtn.click()
  expect(await getApproveModalStatus()).toEqual('true')
  const passwordInput = await page.$(selectors.passwordInput)
  await passwordInput.type('password')
  const okButton = await page.$(selectors.okButton)
  await okButton.click()

  await page.waitForSelector(selectors.successModal)

  const successModal = await page.$$eval(
    selectors.successModal,
    element => element.length
  )

  expect(successModal).toEqual(1)
})

it('2 - go to account page on new button press', async () => {
  const newButton = await page.$(selectors.newButton)

  await newButton.click()
  await page.waitFor(1500)
  expect(page.url(HOME_URL))
})
