const Sequelize = require('sequelize')
const TransactionModel = require('./models/Transaction')

const storeTransactions = async transactions => {
  // options.dialectModule default = pg per:
  // https://sequelize.org/master/class/lib/sequelize.js~Sequelize.html#instance-constructor-constructor
  const sequelize = new Sequelize(
    process.env.PGDATABASE,
    process.env.PGUSER,
    process.env.PGPASSWORD,
    {
      host: process.env.PGHOST,
      operatorsAliases: false,
      logging: console.log,
      port: process.env.PGPORT,
      dialect: 'postgres',
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
  sequelize.close().then(() => console.log('postgres connection closed'))
  return result
}

module.exports = storeTransactions
