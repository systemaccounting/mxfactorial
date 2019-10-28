const { BASE_URL, SELECTORS } = require('../constants')

beforeEach(async () => {
  jest.setTimeout(15000)
  await page.goto(BASE_URL)
  await page.waitForSelector(SELECTORS.createAccountButton)
})

describe('landing screen', () => {
  it('displays browser title', async () => {
    let browserTitle = await page.title()
    expect(browserTitle).toBe('Mx! web client')
  })

  it('displays buttons and inputs', async () => {
    const mxfactorialLogoCount = await page.$$eval(
      SELECTORS.landingScreenLogo,
      logos => logos.length
    )
    const accountInputCount = await page.$$eval(
      SELECTORS.accountInput,
      input => input.length
    )
    const passwordInputCount = await page.$$eval(
      SELECTORS.passwordInput,
      input => input.length
    )
    const createAccountButtonCount = await page.$$eval(
      SELECTORS.createAccountButton,
      a => a.length
    )
    const signInButtonCount = await page.$$eval(
      SELECTORS.signInButton,
      button => button.length
    )
    const landingScreenAssetInventoryCount =
      mxfactorialLogoCount +
      accountInputCount +
      passwordInputCount +
      createAccountButtonCount +
      signInButtonCount
    expect(landingScreenAssetInventoryCount).toBe(5)
  })

  it('version displays on landing screen', async () => {
    const versionElCount = await page.$$eval(
      SELECTORS.appVersionLabel,
      list => list.length
    )
    expect(versionElCount).toBe(1)
  })
})
