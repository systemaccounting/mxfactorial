const requestRules = (httpService, url, transactions) =>
httpService.post(url, transactions).then(response => response.data)

module.exports = requestRules
