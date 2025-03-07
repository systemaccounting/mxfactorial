import type { PageServerLoad, RequestEvent } from './$types';
import { createClient } from '../../graphql/client';
import { env } from '$env/dynamic/public';
import { Cookies } from '../../utils/cookie';
import BALANCE_QUERY from '../../graphql/query/balance';
import REQUESTS_BY_ACCOUNT_QUERY from '../../graphql/query/requestsByAccount';
import { duplicateRequestsPerRole } from '../../utils/transactions';
import { requestTime } from '../../utils/transactions';

interface IRequestsResponse {
	account: string;
	transactions: App.ITransaction[];
	balance: string;
}

export const load: PageServerLoad = async (page: RequestEvent) => {
	const cookieList = page.cookies.getAll();
	const cookies = new Cookies(env.PUBLIC_CLIENT_ID, cookieList);
	const lastAuthUser = cookies.lastAuthUser();
	const client = createClient(env.PUBLIC_GRAPHQL_URI, env.PUBLIC_GRAPHQL_RESOURCE, cookies.idToken());

	const response: IRequestsResponse = {
		account: lastAuthUser,
		transactions: [],
		balance: '0.000',
	};

	const variables = {
		auth_account: lastAuthUser,
		account_name: lastAuthUser,
	};

	const balance = await client.query(BALANCE_QUERY, variables);
	if (!balance.error) {
		response.balance = balance.data.balance;
	} else {
		console.error(balance.error);
	}

	const transactionRequests = await client.query(REQUESTS_BY_ACCOUNT_QUERY, variables);

	if (!transactionRequests.error) {
	// duplicate transaction requests where account appears as debitor and
	// creditor across transaction items (requires 2 approvals)
	const requestsPerRole = duplicateRequestsPerRole(
		lastAuthUser,
		transactionRequests.data.requestsByAccount
	) // and sort by request time
		.sort((a: App.ITransaction, b: App.ITransaction) => {
		if (requestTime(a.transaction_items) < requestTime(b.transaction_items)) {
			return 1;
		}
		return -1;
		});

		response.transactions = requestsPerRole;
	} else {
		console.error(transactionRequests.error);
	}
	return response;
};