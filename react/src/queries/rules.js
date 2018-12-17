import gql from 'graphql-tag'

export default gql`
  {
    rules(transactions: $transactions) {
      id
    }
  }
`
