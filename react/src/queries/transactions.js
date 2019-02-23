import gql from 'graphql-tag'

const insertTransactions = gql`
  mutation insertTransactions($transactions: [TransactionItem]) {
    rules(transactions: $transactions) {
      uuid
      name
      price
      quantity
      rule_instance_id
    }
  }
`

export { insertTransactions }
