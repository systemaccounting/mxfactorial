const restore = async page => {
  let json = JSON.parse(process.env.__storage)
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
