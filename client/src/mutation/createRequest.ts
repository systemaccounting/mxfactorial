import { gql } from "@urql/svelte";

const CREATE_REQUEST_MUTATION = gql`
	mutation createRequest($transaction_items: [TransactionItemInput!], $auth_account: String!) {
		createRequest(transaction_items: $transaction_items, auth_account: $auth_account) {
			id
		}
	}
`;

export default CREATE_REQUEST_MUTATION;