import gql from 'graphql-tag'

export const createTransaction = gql`
  mutation createRequest($items: [RequestCreateInput]!) {
    createRequest(items: $items) {
      author
      debitor
      debitor_approval_time
      creditor
      creditor_approval_time
      name
      price
      quantity
      rule_instance_id
      transaction_id
      id
    }
  }
`

export const fetchRequests = gql`
  query requestsByAccount($account: String) {
    requestsByAccount(account: $account) {
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

export const fetchRequestById = gql`
  query requestsByID($transactionId: String) {
    requestsByID(transactionID: $transactionId) {
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
