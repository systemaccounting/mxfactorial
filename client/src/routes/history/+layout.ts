import type { PageLoad } from './$types';
import TRANSACTIONS_BY_ACCOUNT_QUERY from '../../query/transactionsByAccount';
import client from '../../client/graphql'

import { getAccount } from '../../stores/account'

export const load = (async () => {

	const account = getAccount()

	const variables = {
		auth_account: account,
		account_name: account
	}

	const res = await client.query(TRANSACTIONS_BY_ACCOUNT_QUERY, variables).toPromise()

	return res.data

}) satisfies PageLoad;