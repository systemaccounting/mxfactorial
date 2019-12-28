const Sequelize = require('sequelize')
const RequestModel = require('./models/Request')

const updateRequest = (
  sequelizeIntance,
  transactionID,
  approvalTimestampProperty
  ) => {
  // define request model
  const Request = RequestModel(
    sequelizeIntance,
    Sequelize
  )
  return Request.update(
    { [approvalTimestampProperty]: new Date() },
    {
      where: { transaction_id: transactionID },
      returning: 1,
    }
  )
}

module.exports = updateRequest
