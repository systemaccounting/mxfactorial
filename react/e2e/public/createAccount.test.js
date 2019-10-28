const { BASE_URL, SELECTORS } = require('../constants')
const { deleteUser } = require('../utils/teardown')
const { logout } = require('../utils/auth')

const randomSevenDigitString = () => {
  let num = Math.floor(Math.random() * (9999999 - 1000000)) + 1000000
  return num.toString()
}

const firstName = 'Faker'
const lastName = randomSevenDigitString()
const PUBLIC_TEST_ACCOUNT = firstName + lastName

beforeAll(async () => {
  jest.setTimeout(20000)
})

beforeEach(async () => {
  await page.goto(BASE_URL)
  await page.waitForSelector(SELECTORS.createAccountButton)
})

afterEach(async () => {
  await logout(page)
})

afterAll(async () => {
  // Faker value matched by daily db cleanup script if afterAll fails
  // terraform/workspaces/cognito/delete-faker-accounts/index.js:8
  await deleteUser(process.env.REACT_APP_POOL_ID, PUBLIC_TEST_ACCOUNT)
})

it(`create cognito account`, async () => {
  const accountInput = await page.$(SELECTORS.accountInput)
  await accountInput.type(PUBLIC_TEST_ACCOUNT)
  const passwordInput = await page.$(SELECTORS.passwordInput)
  await passwordInput.type('password')
  const submitButton = await page.$(SELECTORS.createAccountButton)
  await submitButton.click()
  await page.waitForSelector(SELECTORS.creditButton)
  await expect(page.url()).toEqual(`${BASE_URL}/account`)
})
