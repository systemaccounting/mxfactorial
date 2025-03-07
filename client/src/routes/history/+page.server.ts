import type { PageServerLoad, RequestEvent } from './$types';
import { createClient } from '../../graphql/client';
import { env } from '$env/dynamic/public';
import { Cookies } from '../../utils/cookie';
import BALANCE_QUERY from '../../graphql/query/balance';
import TRANSACTIONS_BY_ACCOUNT_QUERY from '../../graphql/query/transactionsByAccount';
import { duplicateTransactionsPerRole, requestTime } from '../../utils/transactions';

interface IHistoryResponse {
	account: string;
	transactions: App.ITransaction[];
	balance: string;
}

export const load: PageServerLoad = async (page: RequestEvent) => {
	const cookieList = page.cookies.getAll();
	const cookies = new Cookies(env.PUBLIC_CLIENT_ID, cookieList);
	const lastAuthUser = cookies.lastAuthUser();
	const client = createClient(env.PUBLIC_GRAPHQL_URI, env.PUBLIC_GRAPHQL_RESOURCE, cookies.idToken());

	let response: IHistoryResponse = {
		account: lastAuthUser,
		transactions: [],
		balance: '0.000',
	};

	const variables = {
		auth_account: lastAuthUser,
		account_name: lastAuthUser,
	};

	const balance = await client.query(BALANCE_QUERY, variables);

	if (balance.error) {
		console.error(balance.error);
	}

	const history = await client.query(TRANSACTIONS_BY_ACCOUNT_QUERY, variables);

	if (!history.data.transactionsByAccount || history.data.transactionsByAccount.length == 0) {
		console.error('zero transactions found');
	}

	// duplicate transactions where account appears
	// debitor and creditor across transaction items
	const transactionsPerRole = duplicateTransactionsPerRole(
		lastAuthUser,
		history.data.transactionsByAccount
	);

	const transactionsByAccount = transactionsPerRole.sort(
		(a: App.ITransaction, b: App.ITransaction) => {
			if (requestTime(a.transaction_items) < requestTime(b.transaction_items)) {
				return 1;
			}
			return -1;
		}
	);

	response = {
		...response,
		transactions: transactionsByAccount,
		balance: balance.data.balance,
	};

	return response;
}