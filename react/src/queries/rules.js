import gql from 'graphql-tag'

export default gql`
  query fetchRules($transactions: [TransactionItem]) {
    rules(transactions: $transactions) {
      uuid
      name
      price
      quantity
      rule_instance_id
    }
  }
`
