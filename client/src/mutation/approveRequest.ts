import { gql } from "@urql/core";

const APPROVE_REQUEST_MUTATION = gql`
	mutation approveRequest($transaction_id: String!, $account_name: String!, $account_role: String!, $auth_account: String!) {
		approveRequest(transaction_id: $transaction_id, account_name: $account_name, account_role: $account_role, auth_account: $auth_account) {
			id
		}
	}
`;

export default APPROVE_REQUEST_MUTATION;