import type { ServerInit } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';

export const init: ServerInit = async () => {
	testRequiredEnvVars();
};

function testRequiredEnvVars() {
	const requiredEnvVars = [
		'PUBLIC_POOL_ID',
		'PUBLIC_CLIENT_ID',
		'PUBLIC_GRAPHQL_URI',
		// 'PUBLIC_GOOGLE_MAPS_API_KEY',
		'PUBLIC_GRAPHQL_RESOURCE',
		'PUBLIC_GRAPHQL_WS_RESOURCE',
	] as const;
	const unsetEnvVars = requiredEnvVars.filter((envVar) => !env[envVar]);
	if (unsetEnvVars.length > 0) {
		throw new Error(`required env vars not set: ${unsetEnvVars.join(', ')}`);
	}
}