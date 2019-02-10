const https = require('https')
const { BASE_URL } = require('./baseUrl')

// alternative version with package dependency:
// const request = require('supertest')
// const warmUpRequest = async () => {
//   var query = `{
//     transactions(transactionId: "0") {
//       id
//     }
//   }`
//   return await request(BASE_URL)
//     .post('/')
//     .set('Content-Type', 'application/graphql')
//     .set('Accept', 'application/json')
//     .send(query)
//     .then(res => {
//       // console.log(res.body.data)
//       // console.log(res.body.data.transactions[0])
//       return res.body.data
//     })
//     .catch(err => {
//       done(err)
//     })
// }

// prior art: https://stackoverflow.com/a/38543075
const warmUpRequest = () => {
  return new Promise((resolve, reject) => {
    var query = `{
      transactions(transactionId: "0") {
        id
      }
    }`
    const options = {
      hostname: BASE_URL,
      port: 443,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/graphql',
        Accept: 'application/json',
        'Content-Length': query.length
      }
    }
    var req = https.request(options, res => {
      // show error code
      if (res.statusCode < 200 || res.statusCode >= 300) {
        // console.log(res.statusCode)
        resolve(res.statusCode)
      }
      // cumulate data
      var body = []
      res.on('data', chunk => {
        body.push(chunk)
      })
      // resolve on end
      res.on('end', () => {
        try {
          body = JSON.parse(Buffer.concat(body).toString())
        } catch (e) {
          reject(e)
        }
        resolve(body)
      })
    })
    // reject on request error
    req.on('error', err => {
      // This is not a "Second reject", just a different sort of failure
      reject(err)
    })
    req.write(query)
    // IMPORTANT
    req.end()
  })
}

var response = `502`
var requestAttempt = 1

console.log(`Warming up lambda and aurora serverless...`) // no ASI
;(async () => {
  // while (typeof response == `undefined` && requestAttempt <= 20) {
  while (response == `502` && requestAttempt <= 20) {
    if (requestAttempt == 20) {
      console.log(`Lambda and aurora serverless not responding.`)
      process.exit(1)
    }
    // console.log(`Attempt #${requestAttempt} to warm up lambda and aurora serverless.`)
    response = await warmUpRequest()
    // console.log(response)
    process.stdout.write('.')
    requestAttempt++
  }
})()

process.stdout.write('\n')
