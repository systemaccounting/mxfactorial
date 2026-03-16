import type { PageServerLoad, RequestEvent } from './$types';
import { loadPageContext } from '../../server/pageContext';

export const load: PageServerLoad = async (page: RequestEvent) => {
	const { account, balance, idToken } = await loadPageContext(page.cookies.getAll());

	return {
		account,
		balance,
		idToken
	};
};
