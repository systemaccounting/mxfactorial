import type { PageServerLoad, RequestEvent } from './$types';
import { loadPageContext } from '../../server/pageContext';
import REQUESTS_BY_ACCOUNT_QUERY from '../../graphql/query/requestsByAccount';
import { duplicatePerRole, requestTime } from '../../utils/transactions';

export const load: PageServerLoad = async (page: RequestEvent) => {
	const { account, balance, client } = await loadPageContext(page.cookies.getAll());

	const variables = {
		auth_account: account,
		account_name: account
	};

	const requests = await client.query(REQUESTS_BY_ACCOUNT_QUERY, variables).toPromise();

	if (requests.error) {
		console.error(requests.error);
	}

	const transactions = duplicatePerRole(account, requests.data?.requestsByAccount ?? []).sort(
		(a: App.ITransaction, b: App.ITransaction) => {
			if (requestTime(a.transaction_items) < requestTime(b.transaction_items)) {
				return 1;
			}
			return -1;
		}
	);

	return {
		account,
		transactions,
		balance
	};
};
