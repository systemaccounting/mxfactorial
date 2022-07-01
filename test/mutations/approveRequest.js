const { gql } = require("graphql-request")

const approveRequest = gql`
  mutation approveRequest($transaction_id: String!, $account_name: String!, $account_role: String!, $auth_account: String!) {
	approveRequest(transaction_id: $transaction_id, account_name: $account_name, account_role: $account_role, auth_account: $auth_account) {
	  id
	  rule_instance_id
	  author
	  author_device_id
	  author_device_latlng
	  author_role
	  equilibrium_time
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

  module.exports = { approveRequest }