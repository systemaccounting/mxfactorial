const fs = require('fs')
const path = require('path')

const restore = async page => {
  let json = JSON.parse(fs.readFileSync(path.join(__dirname, 'storage.json')))
  await page.evaluate(json => {
    localStorage.clear()
    for (let key in json) localStorage.setItem(key, json[key])
  }, json)
  return page
}

const login = async page => {
  return await restore(page)
}

module.exports = login
