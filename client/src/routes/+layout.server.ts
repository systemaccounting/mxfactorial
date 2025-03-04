import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/public';

export const load: PageServerLoad = async () => {
	return {
		poolId: env.PUBLIC_POOL_ID,
		clientId: env.PUBLIC_CLIENT_ID,
	};
};