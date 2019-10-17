const URL =
  process.env.JEST_ENV == `prod`
    ? `api.mxfactorial.io`
    : `${process.env.JEST_ENV}-api.mxfactorial.io`

module.exports = {
  BASE_URL: URL,
  REQUEST_URL: `https://${URL}`
}
