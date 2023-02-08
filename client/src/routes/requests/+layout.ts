import type { PageLoad } from './$types';
import REQUESTS_BY_ACCOUNT_QUERY from '../../query/requestsByAccount';
import client from '../../client/graphql'

import { getAccount } from '../../stores/account'

export const load = (async () => {

	const account = getAccount()

	const variables = {
		auth_account: account,
		account_name: account
	}

	const res = await client.query(REQUESTS_BY_ACCOUNT_QUERY, variables).toPromise()

	return res.data

}) satisfies PageLoad;