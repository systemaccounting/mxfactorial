import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/public';
import { createClient } from '../../../graphql/client';
import { Cookies } from '../../../utils/cookie';
import { isCreditor } from '../../../utils/transactions';
import c from '../../../utils/constants';
import APPROVE_REQUEST_MUTATION from '../../../graphql/mutation/approveRequest';

export const POST: RequestHandler = async (event) => {
	const cookieList = event.cookies.getAll();
	const cookies = new Cookies(env.PUBLIC_CLIENT_ID, cookieList);
	const lastAuthUser = cookies.lastAuthUser();
	const client = createClient(env.PUBLIC_GRAPHQL_URI, env.PUBLIC_GRAPHQL_RESOURCE, cookies.idToken());
	const transactionRequestId = event.params.slug;
	// todo: add reject bool to request and handle with reject mutation
	const { transaction_items }: App.ITransaction = await event.request.json();
	const accountRole = isCreditor(lastAuthUser, transaction_items) ? c.CREDITOR : c.DEBITOR;
	const variables = {
		auth_account: lastAuthUser,
		id: transactionRequestId,
		account_name: lastAuthUser,
		account_role: accountRole,
	};
	const resp = await client.mutation(APPROVE_REQUEST_MUTATION, variables).toPromise();
	if (resp.error) {
		console.error(resp.error);
		throw json({ error: 'approve request failed' }, {
			status: 500,
		});
	}
	return new Response(null, {
		status: 200,
		statusText: 'OK'
	});
};