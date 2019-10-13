const _ = require('lodash')

// todo: unit tests

function compareTransactions(transactions1, transactions2) {
  if (!transactions1 || !transactions2) {
    return false
  }

  // Sort transactions alphabetically
  const itemsUnderTestArray = _.sortBy(transactions1, 'name')
  const itemsStandardArray = _.sortBy(transactions2, 'name')

  // JSON.Stringify to prettify aws console output
  console.log('Item under test array: ', JSON.stringify(itemsUnderTestArray))
  console.log('Items standard array: ', JSON.stringify(itemsStandardArray))

  const mapFn = ({ name, price, quantity }) => {
    // Omit rules-generated uuid, rule_instance_id, etc
    return {
      name,
      // Stringify, since values can be of different types
      price: _.toString(price),
      quantity: _.toString(quantity)
    }
  }

  const arr1 = JSON.stringify(itemsUnderTestArray.map(mapFn))
  const arr2 = JSON.stringify(itemsStandardArray.map(mapFn))
  const isEqual = arr1 === arr2

  console.log(
    isEqual ? 'EQUALITY: ' : 'UNEQUAL: ',
    JSON.stringify(itemsUnderTestArray),
    JSON.stringify(itemsStandardArray)
  )

  return isEqual
}

module.exports = compareTransactions
