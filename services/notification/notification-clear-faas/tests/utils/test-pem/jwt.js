const jwt = require('jsonwebtoken')
const fs = require('fs')
const key = fs.readFileSync('./key.pem')

const headerObj = { kid: '12345678901234567890123456789123456789123456=', alg: 'RS256' }

const payloadObj = {
  sub: '12345678-1234-1234-1234-123456789012',
  aud: '12345678901234567890123456',
  event_id: '12345678-1234-5678-9123-123456789012',
  token_use: 'ab',
  auth_time: 1234567890,
  iss: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_123456789',
  'cognito:username': 'testacct',
  exp: 1234567890,
  iat: 1234567890
}

const opts = {
  algorithm: 'RS256',
  header: headerObj
}

const token = jwt.sign(payloadObj, key, opts)

console.log(token)
fs.writeFileSync('token', token)
