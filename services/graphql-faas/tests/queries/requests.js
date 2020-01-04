const requestsByAccount = `
  query RequestsByAccount($account: String) {
    transactions(account: $account) {
      id
      debitor
      debitor_approval_time
      creditor
      creditor_approval_time
      name
      price
      quantity
      transaction_id
      author
      expiration_time
    }
  }
`

module.exports = requestsByAccount