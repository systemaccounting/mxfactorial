const aws = require('aws-sdk')
const axios = require('axios')
const _ = require('lodash')

const stroreTransactions = require('./storeTransactions')

const { RULES_URL } = process.env

const addTransaction = async (obj, conn) => {
  if (!obj.items) {
    console.log(`Empty object received by resolver`)
    return `Please specify at least 1 transaction`
  }

  // service assigns recieved items as itemsUnderTestArray, then logs
  const itemsUnderTestArray = _.sortBy(obj.items, 'name')
  console.log('Item under test array: ', JSON.stringify(itemsUnderTestArray))

  const responseFromRules = await axios
    .post(RULES_URL, itemsUnderTestArray)
    .then(response => response.data)

  // sqs omits Message property if queue empty or messages not visible (in flight)
  if (responseFromRules) {
    const itemsStandardArray = _.sortBy(responseFromRules, 'name')

    // JSON.Stringify to prettify aws console output
    console.log('Items standard array: ', JSON.stringify(itemsStandardArray))

    // test itemsUnderTestArray for equality with itemsStandardArray (use sortBy first)
    const isEqual = _.isEqualWith(
      itemsUnderTestArray,
      itemsStandardArray,
      (obj1, obj2) => {
        // Avoid comparing rules-generated uuid, rule_instance_id
        const { name: n1, price: p1, quantity: q1 } = obj1
        const { name: n2, price: p2, quantity: q2 } = obj1
        return n1 === n2 && p1 == p2 && q1 == q2
      }
    )

    if (!isEqual) {
      // Arrays are not equal, log error message with unidentical item arrays
      console.log(
        'UNEQUAL',
        JSON.stringify(itemsUnderTestArray),
        JSON.stringify(itemsStandardArray)
      )
      return false
    }

    // Arrays are equal, log success message with identical item arrays
    console.log(
      'EQUALITY',
      JSON.stringify(itemsUnderTestArray),
      JSON.stringify(itemsStandardArray)
    )
    return await stroreTransactions(itemsUnderTestArray)
  }

  return false
}

module.exports = {
  addTransaction
}
