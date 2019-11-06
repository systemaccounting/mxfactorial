const fs = require('fs')

const exponentValue = ``
const modulusValue = ``

const encode = data => {
  let buff = Buffer.from(data)
  return buff.toString('base64')
}
const encodedExponentValue = encode(exponentValue)
const encodedModulusValue = encode(modulusValue)

const jwk = {
  "kid": "12345678901234567890123456789123456789123456=",
  "alg": "RS256",
  "kty": "RSA",
  "e": encodedExponentValue,
  "n": encodedModulusValue,
  "use": "sig"
}
const jwkJson = JSON.stringify(jwk)

console.log(jwkJson)
fs.writeFileSync('jwk.json', jwkJson)
