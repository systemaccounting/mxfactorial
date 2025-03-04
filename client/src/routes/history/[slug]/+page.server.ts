import type { PageServerLoad, RequestEvent } from './$types';
import BALANCE_QUERY from '../../../graphql/query/balance';
import TRANSACTION_BY_ID_QUERY from '../../../graphql/query/transactionByID';
import { createClient } from '../../../graphql/client';
import { env } from '$env/dynamic/public';
import { Cookies } from '../../../utils/cookie';
import { sortTrItems } from '../../../utils/transactions';

interface ITransactionResponse {
	account: string;
	transaction: App.ITransaction | null;
	balance: string;
}

export const load: PageServerLoad = async (page: RequestEvent) => {
	const clientId = env.PUBLIC_CLIENT_ID;
	const cookieList = page.cookies.getAll();
	const cookies = new Cookies(clientId, cookieList);
	const lastAuthUser = cookies.lastAuthUser();
	const transactionId = page.params.slug;
	const client = createClient(env.PUBLIC_GRAPHQL_URI, cookies.idToken());

	let response: ITransactionResponse = {
		account: lastAuthUser,
		transaction: null,
		balance: '0.000',
	};

	const balanceVariables = {
		auth_account: lastAuthUser,
		account_name: lastAuthUser,
	};

	const balance = await client.query(BALANCE_QUERY, balanceVariables);

	if (balance.error) {
		console.error(balance.error);
	}

	const transactionVariables = {
		...balanceVariables,
		id: transactionId,
	};

	const transaction = await client.query(TRANSACTION_BY_ID_QUERY, transactionVariables);

	if (transaction.error) {
		console.error(transaction.error);
	}

	if (!transaction.data.transactionByID) {
		console.error('transaction not found');
	}

	sortTrItems(transaction.data.transactionByID.transaction_items);

	response = {
		...response,
		account: lastAuthUser,
		transaction: transaction.data.transactionByID,
		balance: balance.data.balance,
	};

	return response;
};