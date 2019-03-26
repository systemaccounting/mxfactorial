const axios = require('axios')

const { RULES_URL } = process.env

const requestRules = transactions =>
  axios.post(RULES_URL, transactions).then(response => response.data)

module.exports = requestRules
