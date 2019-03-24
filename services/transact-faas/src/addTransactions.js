const axios = require('axios')
const _ = require('lodash')

const compareTransactions = require('./compareTransactions')
const stroreTransactions = require('./storeTransactions')

const { RULES_URL } = process.env

const addTransaction = async (obj, conn) => {
  if (!obj.items) {
    console.log(`Empty object received by resolver`)
    return `Please specify at least 1 transaction`
  }

  if (!obj.items.length) {
    return obj.items
  }

  // service assigns recieved items as itemsUnderTestArray, then logs
  const itemsUnderTestArray = _.sortBy(obj.items, 'name')
  console.log('Item under test array: ', JSON.stringify(itemsUnderTestArray))

  const responseFromRules = await axios
    .post(RULES_URL, itemsUnderTestArray)
    .then(response => response.data)

  if (!responseFromRules) {
    return []
  }

  const itemsStandardArray = _.sortBy(responseFromRules, 'name')

  // JSON.Stringify to prettify aws console output
  console.log('Items standard array: ', JSON.stringify(itemsStandardArray))

  // test itemsUnderTestArray for equality with itemsStandardArray (use sortBy first)
  const isEqual = compareTransactions(itemsUnderTestArray, itemsStandardArray)

  if (!isEqual) {
    // Arrays are not equal, log error message with unidentical item arrays
    console.log(
      'UNEQUAL',
      JSON.stringify(itemsUnderTestArray),
      JSON.stringify(itemsStandardArray)
    )
    return []
  }

  // Arrays are equal, log success message with identical item arrays
  console.log(
    'EQUALITY',
    JSON.stringify(itemsUnderTestArray),
    JSON.stringify(itemsStandardArray)
  )
  return await stroreTransactions(itemsUnderTestArray)
}

module.exports = {
  addTransaction
}
