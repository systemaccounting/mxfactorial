const { addTransaction } = require('./src/addTransactions')

exports.handler = async event => {
  return await addTransaction(event)
}
