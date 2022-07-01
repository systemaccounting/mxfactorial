const { gql } = require("graphql-request")

const getTransactionByID = gql`
query getTransactionByID($transaction_id: String!, $auth_account: String!) {
	transactionByID(transaction_id: $transaction_id, auth_account: $auth_account) {
	  id
	  rule_instance_id
	  author
	  author_device_id
	  author_device_latlng
	  author_role
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
		  approvals {
			  id
			  rule_instance_id
			  transaction_id
			  transaction_item_id
			  account_name
			  account_role
			  device_id
			  device_latlng
			  approval_time
			  rejection_time
			  expiration_time
		  }
	  }
	}
  }`

  module.exports = { getTransactionByID }