// parse key id from token
const getClaimedKeyId = token => {
  let header = token.split('.')[0]
  let decodedHeader = Buffer.from(header, 'base64').toString('ascii')
  let keyIdObj = JSON.parse(decodedHeader)
  let claimedKeyId = keyIdObj.kid
  return claimedKeyId
}

// match token's key id to cognito's web key
const matchCognitoWebKey = (keys, claimedKeyId) => {
  let matchedCognitoKey = []
  for (key of keys) {
    if (claimedKeyId == key.kid) {
      matchedCognitoKey.push(key)
    }
  }

  if (matchedCognitoKey.length < 1) {
    console.log('0 claimed cognito keys matched. exiting')
    throw new Error('0 claimed cognito keys matched')
  }

  if (matchedCognitoKey.length > 1) {
    console.log('duplicate claimed cognito keys matched.')
    // todo: alert event
  }

  let matchedCognitoWebKey = matchedCognitoKey[0]
  return matchedCognitoWebKey
}

// convert web key to cert for verify
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
  matchCognitoWebKey,
  pem,
  verifyToken
}