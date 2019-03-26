const storeTransactions = transactions => {
  console.log('Mocking request rules: ', transactions)
  return new Promise(resolve => resolve(transactions))
}

module.exports = storeTransactions
