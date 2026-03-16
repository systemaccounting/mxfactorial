import { gql } from '@urql/core';

const CREATE_REQUEST_MUTATION = gql`
	mutation createRequest($transaction: TransactionInput!, $auth_account: String!) {
		createRequest(transaction: $transaction, auth_account: $auth_account) {
			id
		}
	}
`;

export default CREATE_REQUEST_MUTATION;
