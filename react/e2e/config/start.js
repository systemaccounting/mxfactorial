const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')

const { BASE_URL, HOME_SELECTOR } = require('../constants')

const save = async page => {
  const json = await page.evaluate(() => {
    let json = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      json[key] = localStorage.getItem(key)
    }
    return json
  })
  fs.writeFileSync(
    path.join(__dirname, '../utils/storage.json'),
    JSON.stringify(json)
  )
}

module.exports = async () => {
  browser = await puppeteer.launch({
    args: ['--no-sandbox']
  })

  page = await browser.newPage()
  page.goto(BASE_URL)
  await page.waitForSelector('button[data-id="login"]')
  const accountInput = await page.$('[name=account]')
  await accountInput.type('JoeSmith')
  const passwordInput = await page.$('[name=password]')
  await passwordInput.type('password')
  await page.keyboard.press('Enter')

  await page.waitForSelector(HOME_SELECTOR)
  await save(page)
}
