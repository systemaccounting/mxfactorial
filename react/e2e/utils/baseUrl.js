const URL =
  process.env.ENV == `prod`
    ? `api.mxfactorial.io`
    : `${process.env.ENV}-api.mxfactorial.io`

module.exports = {
  BASE_URL: URL,
  REQUEST_URL: `https://${URL}`
}
