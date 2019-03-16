const applyRules = require('./src/applyRules')

exports.handler = async event => {
  console.log('Received transactions: ', event.transactions)
  const proxyResponse = {}
  proxyResponse.body = applyRules(event.transactions)
  proxyResponse.isBase64Encoded = false
  proxyResponse.statusCode = 200
  proxyResponse.headers = { 'Content-Type': 'application/json' }
  proxyResponse.multiValueHeaders = {}
  return proxyResponse
}
