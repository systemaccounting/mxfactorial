const { SELECTORS, REQUEST_URL, HOME_URL } = require('../../constants')

describe('Request detail screen success modal', () => {
  beforeAll(async () => {
    jest.setTimeout(30000)
    await page.goto(REQUEST_URL, { waitUntil: 'networkidle0' })
    await page.waitForSelector(SELECTORS.activeButton)
    const link = await page.$(SELECTORS.requestItem)
    await link.click()
    await page.waitForSelector(SELECTORS.requestingAccountIndicator)
  })

  const getApproveModalStatus = async () =>
    await page.$eval(SELECTORS.approveModal, element =>
      element.getAttribute('data-open')
    )

  it('1 - show success modal', async () => {
    const transactBtn = await page.$(SELECTORS.transactButton)
    await transactBtn.click()
    expect(await getApproveModalStatus()).toEqual('true')
    const passwordInput = await page.$(SELECTORS.modalPasswordInput)
    await passwordInput.type(process.env.JEST_SECRET)
    await page.waitForSelector(SELECTORS.okButton)
    const okButton = await page.$(SELECTORS.okButton)
    await page.waitFor(1000)
    await okButton.click()

    await page.waitForSelector(SELECTORS.successModal)

    const successModal = await page.$$eval(
      SELECTORS.successModal,
      element => element.length
    )

    expect(successModal).toEqual(1)
  })

  it('2 - go to account page on new button press', async () => {
    const newButton = await page.$(SELECTORS.newButton)

    await newButton.click()
    await page.waitFor(1500)
    expect(page.url(HOME_URL))
  })
})
