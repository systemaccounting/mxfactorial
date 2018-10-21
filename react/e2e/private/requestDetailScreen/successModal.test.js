const puppeteer = require('puppeteer')
const login = require('../../utils/login')

const { BASE_URL, REQUEST_URL, HOME_URL } = require('../../constants')

const activeButtonSelector = 'button[data-id="activeButton"]'

const selectors = {
  backButton: '[data-id="backButton"]',
  approveModal: '[data-id=passwordApproveTransactionPopUp]',
  successModal: '[data-id=transactionSuccessPopup]',
  transactButton: '[data-id="transactButton"]',
  cancelButton: '[data-id="cancelButton"]',
  okButton: '[data-id="okButton"]',
  newButton: '[data-id="newButton"]',
  passwordInput: '[data-id="passwordInputField"]'
}

let browser
let page

beforeAll(async () => {
  browser = await puppeteer.launch({
    args: ['--no-sandbox']
  })

  page = await browser.newPage()
  await page.goto(BASE_URL)
  page = await login(page)
  await page.goto(REQUEST_URL)
  await page.waitForSelector(activeButtonSelector)
  const link = await page.$('[data-id="requestItemIndicator"]')
  await link.click()
})

afterAll(async () => {
  await browser.close()
})

const getApproveModalStatus = async () =>
  await page.$eval(selectors.approveModal, element =>
    element.getAttribute('data-open')
  )

test('1 - show success modal', async () => {
  const transactBtn = await page.$(selectors.transactButton)
  await transactBtn.click()
  expect(await getApproveModalStatus()).toEqual('true')
  const passwordInput = await page.$(selectors.passwordInput)
  await passwordInput.type('TRUE')
  const okButton = await page.$(selectors.okButton)
  await okButton.click()

  await page.waitForSelector(selectors.successModal)

  const successModal = await page.$$eval(
    selectors.successModal,
    element => element.length
  )

  expect(successModal).toEqual(1)
})

test('2 - go to account page on new button press', async () => {
  const newButton = await page.$(selectors.newButton)

  await newButton.click()
  await page.waitFor(500)
  expect(page.url(HOME_URL))
})
