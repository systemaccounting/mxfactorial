import type { Client } from '@urql/core';
import { createClient } from '../graphql/client';
import { Cookies } from '../utils/cookie';
import { env } from '$env/dynamic/public';
import BALANCE_QUERY from '../graphql/query/balance';

interface PageContext {
	account: string;
	balance: string;
	client: Client;
	idToken: string;
}

type CookieList = Array<{ name: string; value: string }>;

export async function loadPageContext(cookieList: CookieList): Promise<PageContext> {
	const cookies = new Cookies(env.PUBLIC_CLIENT_ID, cookieList);
	const account = cookies.lastAuthUser();
	const idToken = cookies.idToken();
	const client = createClient(env.PUBLIC_GRAPHQL_URI, env.PUBLIC_GRAPHQL_RESOURCE, idToken);

	const variables = {
		auth_account: account,
		account_name: account
	};

	const res = await client.query(BALANCE_QUERY, variables).toPromise();

	if (res.error) {
		console.error(res.error);
	}

	return {
		account,
		balance: res.data?.balance ?? '0.000',
		client,
		idToken
	};
}
