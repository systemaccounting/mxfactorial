const _ = require('lodash')

module.exports = function compareTransactions(transactions1, transactions2) {
  if (!transactions1 || !transactions2) {
    return false
  }

  const mapFn = ({ name, price, quantity }) => {
    // Omit rules-generated uuid, rule_instance_id, etc
    return {
      name,
      // Stringify, since values can be of different types
      price: _.toString(price),
      quantity: _.toString(quantity)
    }
  }

  // Sort items alphabetically
  const sortFn = (a, b) => {
    if (a.name > b.name) {
      return 1
    }
    if (a.name < b.name) {
      return -1
    }
    return 0
  }

  const arr1 = JSON.stringify(transactions1.sort(sortFn).map(mapFn))
  const arr2 = JSON.stringify(transactions2.sort(sortFn).map(mapFn))
  return arr1 === arr2
}
