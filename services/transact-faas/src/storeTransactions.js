const Sequelize = require('sequelize')
const TransactionModel = require('./models/Transaction')

const DB_NAME = 'mxfactorial'
const DB_USERNAME = process.env.USER
const DB_PASSWORD = process.env.PASSWORD
const DB_HOST = process.env.HOST

const storeTransactions = async transactions => {
  const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'mysql',
    pool: {
      min: 0,
      max: 5,
      acquire: 30000,
      idle: 10000
    }
  })

  // Define transaction model
  const Transaction = TransactionModel(sequelize, Sequelize)
  console.log('Transaction model: ', Transaction)

  // Close connection
  sequelize.close()
}

module.exports = storeTransactions
