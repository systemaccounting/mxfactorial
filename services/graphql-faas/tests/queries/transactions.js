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

const fetchTransactions = `
  query FetchTransactions($user: String) {
    transactions(user: $user) {
      id
      name
      quantity
      price
      author
      debitor
      creditor
      creditor_approval_time
      debitor_approval_time
      expiration_time
    }
  }
`

module.exports = {
  fetchTransactions,
  createTransaction
}
