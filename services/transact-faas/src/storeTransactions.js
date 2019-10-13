const Sequelize = require('sequelize')
const TransactionModel = require('./models/Transaction')

const DB_NAME = 'mxfactorial'

// todo: unit and integration tests

const storeTransactions = async transactions => {
  const sequelize = new Sequelize(
    DB_NAME,
    process.env.USER,
    process.env.PASSWORD,
    {
      host: process.env.HOST,
      operatorsAliases: false,
      logging: console.log,
      port: 3306,
      dialect: 'mysql',
      pool: {
        min: 0,
        max: 5,
        acquire: 30000,
        idle: 10000,
        handleDisconnects: true
      }
    }
  )

  // Define transaction model
  const Transaction = TransactionModel(sequelize, Sequelize)
  const result = await Transaction.bulkCreate(transactions, {
    individualHooks: true
  })
  // Close connection
  sequelize.close().then(() => console.log('MySQL connection closed'))
  return result
}

module.exports = storeTransactions
