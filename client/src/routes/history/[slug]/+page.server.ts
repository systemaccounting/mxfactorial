import type { PageServerLoad, RequestEvent } from './$types';
import { loadPageContext } from '../../../server/pageContext';
import TRANSACTION_BY_ID_QUERY from '../../../graphql/query/transactionByID';
import { sortTrItems } from '../../../utils/transactions';

export const load: PageServerLoad = async (page: RequestEvent) => {
	const { account, balance, client } = await loadPageContext(page.cookies.getAll());

	const variables = {
		auth_account: account,
		account_name: account,
		id: page.params.slug
	};

	const transaction = await client.query(TRANSACTION_BY_ID_QUERY, variables).toPromise();

	if (transaction.error) {
		console.error(transaction.error);
	}

	if (transaction.data?.transactionByID) {
		sortTrItems(transaction.data.transactionByID.transaction_items);
	}

	return {
		account,
		transaction: transaction.data?.transactionByID ?? null,
		balance
	};
};
