const storeTransactions = transactions => {
  return new Promise(resolve => resolve(transactions))
}

module.exports = jest.fn(storeTransactions)
