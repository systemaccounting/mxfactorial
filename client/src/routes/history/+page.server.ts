import type { PageServerLoad, RequestEvent } from './$types';
import { loadPageContext } from '../../server/pageContext';
import TRANSACTIONS_BY_ACCOUNT_QUERY from '../../graphql/query/transactionsByAccount';
import { duplicatePerRole, requestTime } from '../../utils/transactions';

export const load: PageServerLoad = async (page: RequestEvent) => {
	const { account, balance, client } = await loadPageContext(page.cookies.getAll());

	const variables = {
		auth_account: account,
		account_name: account
	};

	const history = await client.query(TRANSACTIONS_BY_ACCOUNT_QUERY, variables).toPromise();

	if (history.error) {
		console.error(history.error);
	}

	const transactionsPerRole = duplicatePerRole(account, history.data?.transactionsByAccount ?? []);

	const transactions = transactionsPerRole.sort((a: App.ITransaction, b: App.ITransaction) => {
		if (requestTime(a.transaction_items) < requestTime(b.transaction_items)) {
			return 1;
		}
		return -1;
	});

	return {
		account,
		transactions,
		balance
	};
};
