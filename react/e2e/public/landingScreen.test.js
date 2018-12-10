const { BASE_URL } = require('../constants')

describe('Landing screen', () => {
  it('displays browser title', async () => {
    await page.goto(BASE_URL)
    let browserTitle = await page.title()
    expect(browserTitle).toBe('Mx! web client')
  })

  it('displays buttons and inputs', async () => {
    await page.goto(BASE_URL)
    const mxfactorialLogoCount = await page.$$eval(
      '.create-account-logo',
      logos => logos.length
    )
    const accountInputCount = await page.$$eval(
      '[name="account"]',
      input => input.length
    )
    const passwordInputCount = await page.$$eval(
      '[name="password"]',
      input => input.length
    )
    const createAccountButtonCount = await page.$$eval(
      '[href="/auth/create-account"]',
      a => a.length
    )
    const signInButtonCount = await page.$$eval(
      '[data-id="login"]',
      button => button.length
    )
    const landingScreenContent =
      mxfactorialLogoCount +
      accountInputCount +
      passwordInputCount +
      createAccountButtonCount +
      signInButtonCount
    expect(landingScreenContent).toBe(5)
  })

  it('version displays on landing screen', async () => {
    const versionElCount = await page.$$eval(
      '[data-id="appVersion"]',
      list => list.length
    )
    expect(versionElCount).toBe(1)
  })

  it('clicks create button navigates account create page', async () => {
    const createAccountButton = await page.$(`button[name="create-account"]`)
    await createAccountButton.click()
  })
})
