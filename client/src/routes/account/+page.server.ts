import type { PageServerLoad, RequestEvent } from './$types';
import BALANCE_QUERY from '../../graphql/query/balance';
import { createClient } from '../../graphql/client';
import { env } from '$env/dynamic/public';
import { Cookies } from '../../utils/cookie';

export const load: PageServerLoad = async (page: RequestEvent) => {
	const clientId = env.PUBLIC_CLIENT_ID;
	const cookieList = page.cookies.getAll(); // magic: read cookies on server
	const cookies = new Cookies(clientId, cookieList);
	const lastAuthUser = cookies.lastAuthUser();
	const client = createClient(env.PUBLIC_GRAPHQL_URI, cookies.idToken());

	const variables = {
		auth_account: lastAuthUser,
		account_name: lastAuthUser
	};

	const res = await client.query(BALANCE_QUERY, variables);

	if (res.error) {
		console.error(res.error);
	}

	return {
		account: lastAuthUser,
		balance: res.data.balance,
		idToken: cookies.idToken(),
	};
};