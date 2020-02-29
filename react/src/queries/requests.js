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

export const approveRequest = gql`
  mutation approveRequest($items: [RequestApproveInput]!) {
    approveRequest(items: $items) {
      transaction_id
      id
      author
      debitor
      debitor_profile_latlng
      debitor_transaction_latlng
      debitor_approval_time
      debitor_device
      creditor
      creditor_profile_latlng
      creditor_transaction_latlng
      creditor_approval_time
      creditor_device
      name
      price
      quantity
      unit_of_measurement
      units_measured
      rule_instance_id
      expiration_time
    }
  }
`
