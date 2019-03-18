const createTransaction = `
  mutation CreateTransaction($items: [TransactionCreateType]) {
    createTransaction(items: $items) {
      name
      quantity
      price
      creditor
    }
  }
`

module.exports = {
  createTransaction
}
