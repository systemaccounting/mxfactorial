import gql from 'graphql-tag'

const createTransaction = gql`
  mutation CreateTransaction($items: [TransactionInputType]) {
    createTransaction(items: $items) {
      name
      quantity
      price
    }
  }
`

export { createTransaction }
