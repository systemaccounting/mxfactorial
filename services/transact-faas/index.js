const axios = require('axios')
const mysql = require('mysql2')
const { addTransaction } = require('./src/addTransactions')

const RULES_URL = process.env.RULES_URL

exports.handler = async (event) => {

  // add temporary property expected by rules index.js:3
  let rulesIntegrationDemo = event
  rulesIntegrationDemo.some = `transactions`

  await axios.post(RULES_URL, rulesIntegrationDemo)
  .then(response => {
    let data = response.data
    console.log(data)
    return data
  })
  .catch(error => {
    console.log(error)
  })

  // if (graphql transactions == rules transactions) {
  if (Object.keys(rulesIntegrationDemo).includes('creditor')) { //tmp to avoid storing test data

    //avoid creating until after event validation
    const connection = mysql.createConnection({
      user: process.env.USER,
      password: process.env.PASSWORD,
      host: process.env.HOST,
      database: 'mxfactorial',
      connectTimeout: 30000 //serverless aurora
    })

    let insert = await addTransaction(rulesIntegrationDemo, connection)
    return insert
  }
// }
}
