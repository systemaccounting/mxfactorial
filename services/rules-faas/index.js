const applyRules = require('./src/applyRules')
const uuidv1 = require('uuid/v1')

exports.handler = async event => {
  if (event.body) {
    const transactions = JSON.parse(event.body)
    console.log('Received transactions: ', event.body)
    const proxyResponse = {}
    proxyResponse.body = JSON.stringify(applyRules(uuidv1(), transactions))
    proxyResponse.isBase64Encoded = false
    proxyResponse.statusCode = 200
    proxyResponse.headers = { 'Content-Type': 'application/json' }
    proxyResponse.multiValueHeaders = {}
    return proxyResponse
  }
  return applyRules(uuidv1(), event.transactions)
}
