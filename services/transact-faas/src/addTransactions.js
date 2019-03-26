const _ = require('lodash')

const compareTransactions = require('./compareTransactions')
const storeTransactions = require('./storeTransactions')
const requestRules = require('./requestRules')

const addTransaction = async (obj, conn) => {
  if (!obj.items) {
    console.log(`Empty object received by resolver`)
    return `Please specify at least 1 transaction`
  }

  if (!obj.items.length) {
    return obj.items
  }

  const responseFromRules = await requestRules(obj.items)

  if (!responseFromRules) {
    return []
  }

  // test itemsUnderTestArray for equality with itemsStandardArray (use sortBy first)
  const isEqual = compareTransactions(obj.items, responseFromRules)

  if (isEqual) {
    return await storeTransactions(obj.items)
  }

  return []
}

module.exports = {
  addTransaction
}
