const BASE_URL = 'http://localhost:3000'
const HOME_URL = `${BASE_URL}/account`
const REQUEST_URL = `${BASE_URL}/requests`
const AUTH_URL = `${BASE_URL}/auth`
const HISTORY_URL = `${BASE_URL}/history`

const HOME_SELECTOR = `[name="account-label"]`

module.exports = {
  BASE_URL,
  HOME_URL,
  REQUEST_URL,
  AUTH_URL,
  HISTORY_URL,
  HOME_SELECTOR
}
