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

const getTransaction = `
  query getTransaction($id: String!) {
    transactions(transactionId: $id) {
      id
    }
  }
`

module.exports = {
  getTransaction,
  createTransaction
}
