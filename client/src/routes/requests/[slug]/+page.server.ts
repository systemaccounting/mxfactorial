import type { PageServerLoad, RequestEvent } from './$types';
import { loadPageContext } from '../../../server/pageContext';
import REQUEST_BY_ID_QUERY from '../../../graphql/query/requestByID';
import { isCreditor, sortTrItems } from '../../../utils/transactions';

export const load: PageServerLoad = async (page: RequestEvent) => {
	const { account, balance, client } = await loadPageContext(page.cookies.getAll());

	const variables = {
		auth_account: account,
		account_name: account,
		id: page.params.slug
	};

	const request = await client.query(REQUEST_BY_ID_QUERY, variables).toPromise();

	if (request.error) {
		console.error(request.error);
	}

	if (request.data?.requestByID) {
		sortTrItems(request.data.requestByID.transaction_items);
	}

	const transaction = request.data?.requestByID ?? null;

	return {
		account,
		transaction,
		balance,
		creditor: transaction ? isCreditor(account, transaction.transaction_items) : true
	};
};
