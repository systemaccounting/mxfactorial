exports.handler = async (event) => {
  console.log(event.body)
  let payload = JSON.parse(event.body)
  const queriedRule = transactions => `const payTax = (${transactions}) => rules-applied ${transactions}`
  let proxyResponse = {}
  proxyResponse.body = queriedRule(payload.some)
  proxyResponse.isBase64Encoded = false
  proxyResponse.statusCode = 200
  proxyResponse.headers = { "Content-Type": "application/json" }
  proxyResponse.multiValueHeaders = {}
  return proxyResponse
}