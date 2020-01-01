import gql from 'graphql-tag'

const fetchRules = gql`
  query fetchRules($transactions: [TransactionInput]) {
    rules(transactions: $transactions) {
      name
      price
      quantity
      author
      debitor
      creditor
      rule_instance_id
    }
  }
`

export { fetchRules }
