const createTransaction = `
  mutation CreateTransaction($items: [TransactionInputType]) {
    createTransaction(items: $items) {
      name
      quantity
      price
      author
      debitor
      creditor
      creditor_approval_time
      debitor_approval_time
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
