const _ = require('lodash')

const compareTransactions = require('./compareTransactions')
const storeTransactions = require('./storeTransactions')
const requestRules = require('./requestRules')

const STATUS_SUCCESS = 'success'
const STATUS_FAILED = 'failed'

const addTransaction = async obj => {
  if (!obj.items) {
    console.log(`Empty object received by resolver`)
    return {
      status: STATUS_FAILED,
      message: 'Please specify at least 1 transaction'
    }
  }

  const responseFromRules = await requestRules(obj.items)

  if (!responseFromRules) {
    return {
      status: STATUS_FAILED,
      message: 'Failed to fetch transactions from /rules service'
    }
  }

  // test itemsUnderTestArray for equality with itemsStandardArray (use sortBy first)
  const isEqual = compareTransactions(obj.items, responseFromRules)

  if (!isEqual) {
    return {
      status: STATUS_FAILED,
      message: 'Required items missing'
    }
  }

  const storedTransactions = await storeTransactions(obj.items)
  return {
    status: STATUS_SUCCESS,
    data: storedTransactions
  }
}

module.exports = {
  addTransaction
}
