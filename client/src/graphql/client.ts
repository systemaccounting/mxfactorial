import { createClient, cacheExchange, fetchExchange } from '@urql/core';
import type { ClientOptions } from '@urql/core';
import { getIdToken } from '../auth/cognito';
import b64 from 'base-64';
import buildUri from '../utils/uriBuilder';

const apiResource = 'query';

const relativeUri: string = b64.decode(process.env.GRAPHQL_URI as string)?.trim() + '/' + apiResource;

const uri: string = buildUri(relativeUri);

const clientOpts: ClientOptions = {
	url: uri,
	exchanges: [cacheExchange, fetchExchange],
	maskTypename: true,
	fetchOptions: {
		credentials: 'same-origin'
	},
	// https://formidable.com/open-source/urql/docs/basics/document-caching/#request-policies
	requestPolicy: 'cache-and-network'
};

if (process.env.ENABLE_API_AUTH == 'true') {
	getIdToken(function (idToken: string) {
		clientOpts.fetchOptions = {
			...clientOpts.fetchOptions,
			headers: {
				Authorization: idToken
			}
		};
	});
}

export default createClient(clientOpts)