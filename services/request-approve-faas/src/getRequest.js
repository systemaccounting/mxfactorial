const Sequelize = require('sequelize')
const RequestModel = require('./models/Request')

const getRequest = (sequelizeIntance, transactionID) => {
  // define request model
  const Request = RequestModel(sequelizeIntance, Sequelize)
  return Request.findAll({
    where: { transaction_id: transactionID }
  })
}

module.exports = getRequest
