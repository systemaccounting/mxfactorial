const mysql = require('mysql2')
const { addTransaction } = require('./src/addTransactions')

//TODO: avoid creating until after event validation
const connection = mysql.createConnection({
  user: process.env.USER,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  database: 'mxfactorial',
  connectTimeout: 30000 //serverless aurora
})

exports.handler = async (event) => {
  // console.log(event)
  let insert = await addTransaction(event, connection)
  return insert
}