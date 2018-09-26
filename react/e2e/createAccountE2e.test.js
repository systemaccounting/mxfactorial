const puppeteer = require(`puppeteer`)

const BASE_URL = `http://localhost:3000`
let browser
let page
const waitOpts = { waitUntil: `load` }

beforeAll(async () => {
  browser = await puppeteer.launch({
    args: [`--no-sandbox`]
    //,headless: false //for visible browser test automation
  })
  page = await browser.newPage()
})

test(
  `Create account in Cognito`,
  async () => {
    const firstName = `Faker`
    const lastName = `${Math.floor(Math.random() * 10000)}`
    const account = firstName + lastName
    await page.goto(BASE_URL + '/account/create')

    await page.waitForSelector(`button[name="next-button"]`)
    const nextButton01 = await page.$(`button[name="next-button"]`)
    await nextButton01.click()
    await page.waitForSelector(`button[name="next-button"]`)
    const nextButton02 = await page.$(`button[name="next-button"]`)
    await nextButton02.click()
    await page.waitForSelector(`button[name="next-button"]`)
    const nextButton03 = await page.$(`button[name="next-button"]`)
    await nextButton03.click()

    await page.waitForSelector(`button[data-id="name"]`)
    const firstNameInput = await page.$(`[name=firstName]`)
    await firstNameInput.type(firstName)
    const middleNameInput = await page.$(`[name=middleName]`)
    await middleNameInput.type(`Def`)
    const lastNameInput = await page.$(`[name=lastName]`)
    await lastNameInput.type(lastName)
    const countryNameInput = await page.$(`[name=country]`)
    await countryNameInput.type(`Jkl`)
    const nextFormBtn01 = await page.$(`button[data-id="name"]`)
    await nextFormBtn01.click()

    await page.waitForSelector(`button[data-id="address"]`)
    const streetNumberInput = await page.$(`[name=streetNumber]`)
    await streetNumberInput.type(`11`)
    const streetNameInput = await page.$(`[name=streetName]`)
    await streetNameInput.type(`Twenty Two`)
    const floorNumberInput = await page.$(`[name=floorNumber]`)
    await floorNumberInput.type(`33`)
    const unitInput = await page.$(`[name=unit]`)
    await unitInput.type(`44`)
    const nextFormBtn02 = await page.$(`button[data-id="address"]`)
    await nextFormBtn02.click()

    await page.waitForSelector(`button[data-id="address-2"]`)
    const cityNameInput = await page.$(`[name=cityName]`)
    await cityNameInput.type(`Mno`)
    const stateNameInput = await page.$(`[name=stateName]`)
    await stateNameInput.type(`PQ`)
    const postalCodeInput = await page.$(`[name=postalCode]`)
    await postalCodeInput.type(`55`)
    const nextButton05 = await page.$(`button[data-id="address-2"]`)
    await nextButton05.click()

    await page.waitForSelector(`button[data-id="address-3"]`)
    const countryDialingCodeInput = await page.$(`[name=countryDialingCode]`)
    await countryDialingCodeInput.type(`66`)
    const areaCodeInput = await page.$(`[name=areaCode]`)
    await areaCodeInput.type(`77`)
    const phoneNumberInput = await page.$(`[name=phoneNumber]`)
    await phoneNumberInput.type(`88`)
    const nextButton06 = await page.$(`button[data-id="address-3"]`)
    await nextButton06.click()

    await page.waitForSelector(`button[data-id="personal-info"]`)
    const dateOfBirthInput = await page.$(`[name=dateOfBirth]`)
    await dateOfBirthInput.type(`10-05-1990`)
    const industryInput = await page.$(`[name=industryName]`)
    await industryInput.type(`Rst`)
    const occupationNameInput = await page.$(`[name=occupationName]`)
    await occupationNameInput.type(`Uvw`)
    const nextButton07 = await page.$(`button[data-id="personal-info"]`)
    await nextButton07.click()

    await page.waitForSelector(`button[data-id="account"]`)
    const accountNameInput = await page.$(`[name=username]`)
    await accountNameInput.type(account)
    const passwordInput = await page.$(`[name=password]`)
    await passwordInput.type(`bluesky`)
    const emailAddressInput = await page.$(`[name=emailAddress]`)
    await emailAddressInput.type(`testabc@mailinator.com`)

    const submitButton = await page.$(`button[data-id="account"]`)
    await submitButton.click()

    await page.waitForSelector('input[name="account"]')

    expect(await page.url()).toEqual(`${BASE_URL}/`)
  },
  20000
)
