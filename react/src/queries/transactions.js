import gql from 'graphql-tag'

export const fetchTransactions = gql`
  query transactionsByAccount($account: String) {
    transactionsByAccount(account: $account) {
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
      transaction_id
      rule_instance_id
    }
  }
`
