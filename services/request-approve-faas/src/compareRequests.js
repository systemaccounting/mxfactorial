const _ = require('lodash')

function compareRequests(requests1, requests2) {
  if (!requests1 || !requests2) {
    return false
  }

  // Sort requests alphabetically
  const itemsUnderTestArray = _.sortBy(requests1, 'name')
  const itemsStandardArray = _.sortBy(requests2, 'name')

  // JSON.Stringify to prettify aws console output
  console.log('items under test array: ', JSON.stringify(itemsUnderTestArray))
  console.log('items standard array: ', JSON.stringify(itemsStandardArray))

  const mapFn = item => {
    return {
      name: item.name,
      // stringify, since values can be of different types
      price: _.toString(item.price),
      quantity: _.toString(item.quantity),
      debitor: item.debitor,
      creditor: item.creditor,
      author: item.author,
      transaction_id: item.transaction_id,
      rule_instance_id: item.rule_instance_id
    }
  }

  const arr1 = JSON.stringify(itemsUnderTestArray.map(mapFn))
  const arr2 = JSON.stringify(itemsStandardArray.map(mapFn))
  const isEqual = arr1 === arr2

  console.log(
    isEqual ? 'EQUAL: ' : 'UNEQUAL ITEMS: ',
    JSON.stringify(itemsUnderTestArray),
    JSON.stringify(itemsStandardArray)
  )

  return isEqual
}

module.exports = compareRequests
