import gql from 'graphql-tag'

export default gql`
  query fetchRules($transactions: [TransactionCreateType]) {
    rules(transactions: $transactions) {
      id
    }
  }
`
