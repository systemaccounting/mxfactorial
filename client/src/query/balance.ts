import { gql } from "@urql/svelte";

const BALANCE_QUERY = gql`
	query balance($account_name: String!, $auth_account: String!) {
		balance(account_name: $account_name, auth_account: $auth_account)
	}
`;

export default BALANCE_QUERY;