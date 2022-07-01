const { gql } = require("graphql-request")

const createRequest = gql`
mutation createRequest($transaction_items: [TransactionItemInput!], $auth_account: String!) {
	createRequest(transaction_items: $transaction_items, auth_account: $auth_account) {
	  id
	  rule_instance_id
	  author
	  author_device_id
	  author_device_latlng
	  author_role
	  sum_value
	  transaction_items {
		  id
		  transaction_id
		  item_id
		  price
		  quantity
		  debitor_first
		  rule_instance_id
		  unit_of_measurement
		  units_measured
		  debitor
		  creditor
		  debitor_profile_id
		  creditor_profile_id
		  debitor_approval_time
		  creditor_approval_time
		  debitor_expiration_time
		  creditor_expiration_time
		  debitor_rejection_time
		  creditor_rejection_time
	  }
	}
  }`

  module.exports = { createRequest }