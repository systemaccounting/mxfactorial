if (
  process.env.JEST_ENV != `qa` &&
  process.env.JEST_ENV != `prod`
) {
  console.log(`Must assign JEST_ENV, e.g. JEST_ENV=qa in package.json script.`)
  process.exit(1)
}

// JEST_ENV must be assigned to env in package.json scripts
const URL = process.env.JEST_ENV == `prod` ?
  `api.mxfactorial.io` :
  `${process.env.JEST_ENV}-api.mxfactorial.io`

module.exports = {
  BASE_URL: URL,
  REQUEST_URL: `https://${URL}`
}