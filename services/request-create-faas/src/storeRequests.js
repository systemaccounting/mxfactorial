const Sequelize = require('sequelize')
const RequestModel = require('./models/Requests')

const storeRequests = async (requests, requesterAccount) => {
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

  // Define request model
  const Request = RequestModel(sequelize, Sequelize, requesterAccount)
  const result = await Request.bulkCreate(requests, {
    individualHooks: true
  })
  // Close connection
  sequelize.close().then(() => console.log('postgres connection closed'))
  return result
}

module.exports = storeRequests
