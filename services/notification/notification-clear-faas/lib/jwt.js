const getClaimedKeyId = token => {
  let header = token.split('.')[0]
  let decodedHeader = Buffer.from(header, 'base64').toString('ascii')
  let keyIdObj = JSON.parse(decodedHeader)
  let claimedKeyId = keyIdObj.kid
  return claimedKeyId
}

const pem = (pemPackage, jsonWebKey) => pemPackage(jsonWebKey)

const verifyToken = async (jwtService, token, jsonWebKeyAsPem, jsonWebKey) => {
  let opts = {
    algorithms: [jsonWebKey.alg],
    issuer: jsonWebKey.iss
  }
  return jwtService.verify(token, jsonWebKeyAsPem, opts)
}

module.exports = {
  getClaimedKeyId,
  pem,
  verifyToken
}