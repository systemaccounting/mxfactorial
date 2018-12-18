import gql from 'graphql-tag'

export default gql`
  query fetchRules($transactions: [TransactionItem]) {
    rules(transactions: $transactions) {
      id
    }
  }
`
