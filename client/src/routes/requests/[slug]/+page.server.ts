import type { PageServerLoad, RequestEvent } from './$types';
import { env } from '$env/dynamic/public';
import { createClient } from '../../../graphql/client';
import { Cookies } from '../../../utils/cookie';
import BALANCE_QUERY from '../../../graphql/query/balance';
import REQUEST_BY_ID_QUERY from '../../../graphql/query/requestByID';
import { isCreditor, sortTrItems } from '../../../utils/transactions';

interface IRequestResponse {
	account: string;
	transaction: App.ITransaction | null;
	balance: string;
	creditor: boolean;
}

export const load: PageServerLoad = async (page: RequestEvent) => {
	const cookieList = page.cookies.getAll();
	const cookies = new Cookies(env.PUBLIC_CLIENT_ID, cookieList);
	const lastAuthUser = cookies.lastAuthUser();
	const requestId = page.params.slug;
	const client = createClient(env.PUBLIC_GRAPHQL_URI, env.PUBLIC_GRAPHQL_RESOURCE, cookies.idToken());

	const response: IRequestResponse = {
		account: lastAuthUser,
		transaction: null,
		balance: '0.000',
		creditor: true,
	};

	const balanceVariables = {
		auth_account: lastAuthUser,
		account_name: lastAuthUser,
	};

	const balance = await client.query(BALANCE_QUERY, balanceVariables).toPromise();

	if (!balance.error) {
		response.balance = balance.data.balance;
	} else {
		console.error(balance.error);
	}

	const requestVariables = {
		...balanceVariables,
		id: requestId,
	};

	const request = await client.query(REQUEST_BY_ID_QUERY, requestVariables).toPromise();

	if (!request.error) {
		if (!request.data.requestByID) {
			console.error('transaction request not found');
		}
		sortTrItems(request.data.requestByID.transaction_items);
		// assign transaction request with sorted
		// transaction items to transaction response field
		response.transaction = request.data.requestByID;
	} else {
		console.error(request.error);
	}

	if (response.transaction) {
		response.creditor = isCreditor(response.account, response.transaction.transaction_items);
	}

	return response;
};
