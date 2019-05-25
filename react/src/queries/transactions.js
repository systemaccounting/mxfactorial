import gql from 'graphql-tag'

export const createTransaction = gql`
  mutation CreateTransaction($items: [TransactionInputType]) {
    createTransaction(items: $items) {
      name
      quantity
      price
      author
      debitor
      creditor
      creditor_approval_time
      debitor_approval_time
    }
  }
`

export const fetchTransactions = gql`
  query {
    transactions {
      name
      quantity
      price
      author
      debitor
      creditor
      creditor_approval_time
      debitor_approval_time
    }
  }
`
