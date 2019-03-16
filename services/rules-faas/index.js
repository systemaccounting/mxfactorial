const applyRules = require('./src/applyRules')

exports.handler = async event => {
  const transactions = JSON.parse(event.body)
  console.log('Received transactions: ', event.body)
  const proxyResponse = {}
  proxyResponse.body = JSON.stringify(applyRules(transactions))
  proxyResponse.isBase64Encoded = false
  proxyResponse.statusCode = 200
  proxyResponse.headers = { 'Content-Type': 'application/json' }
  proxyResponse.multiValueHeaders = {}
  return proxyResponse
}
