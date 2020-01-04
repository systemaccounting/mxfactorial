const fetchTransactions = `
  query FetchTransactions($account: String) {
    transactionsByAccount(account: $account) {
      id
      debitor
      debitor_approval_time
      creditor
      creditor_approval_time
      name
      price
      quantity
      rule_instance_id
      transaction_id
      author
      expiration_time
    }
  }
`

module.exports = fetchTransactions
