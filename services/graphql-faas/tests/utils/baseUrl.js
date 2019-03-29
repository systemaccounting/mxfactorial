if (!['dev', 'prod', 'qa'].includes(process.env.LOCAL_ENV)) {
  console.log(
    'Must assign LOCAL_ENV, e.g. LOCAL_ENV=qa in package.json script.'
  )
  process.exit(1)
}

// LOCAL_ENV must be assigned to env in package.json scripts
const URL =
  process.env.LOCAL_ENV === 'prod'
    ? 'api.mxfactorial.io'
    : `${process.env.LOCAL_ENV}-api.mxfactorial.io`

module.exports = {
  BASE_URL: URL,
  REQUEST_URL: `https://${URL}`
}
