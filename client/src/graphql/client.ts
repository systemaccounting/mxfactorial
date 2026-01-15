import { createClient as createGqlClient, cacheExchange, fetchExchange, mapExchange } from '@urql/core';
import type { ClientOptions, Client } from '@urql/core';
import buildUri from '../utils/uriBuilder';

type MaybeString = string | undefined;

// MaybeString just lets handling unset env vars in one place
function createOpts(relativeUri: MaybeString, resource: MaybeString, idToken: string | null): ClientOptions {
	if (!relativeUri) {
		throw new Error('createOpts: missing relativeUri');
	}
	// need /query for graphql
	if (!resource) {
		throw new Error('createOpts: missing resource');
	}

	// ENABLE_TLS required by uriBuilder() is NOT currently set in project.yaml or
	// used here but TLS remains when relativeUri passed with https:// prefix
	const url = buildUri(relativeUri, resource, false);

	const opts: ClientOptions = {
		url,
		exchanges: [
			mapExchange({
			onResult(result) {
			  return result.operation.kind === 'query'
				? { ...result, data: maskTypename(result.data, true) }
				: result;
			},
			}),
			cacheExchange,
			fetchExchange
		],
		fetchOptions: {
			credentials: 'same-origin'
		},
		// https://formidable.com/open-source/urql/docs/basics/document-caching/#request-policies
		requestPolicy: 'cache-and-network',
		// graphql server doesnt support GET, use POST for all queries
		preferGetMethod: false
	};
	if (idToken) {
		opts.fetchOptions = {
			...opts.fetchOptions,
			headers: {
				Authorization: idToken
			}
		};
	}
	return opts;
}

function createClient(relativeUri: MaybeString, resource: MaybeString, idToken: string | null): Client {
	const opts = createOpts(relativeUri, resource, idToken);
	const client = createGqlClient(opts);
	// uncomment to debug urql:
	// client.subscribeToDebugTarget(event => {
	// 	if (event.source === 'cacheExchange')
	// 		return;
	// 	console.log('event data:', event.data); // { type, message, operation, data, source, timestamp }
	// });
	return client;
}

// alternative to below in each request: const { __typename, ...rest } = res.data;
// https://github.com/urql-graphql/urql/blob/f14c94caeb8fdbda92a1c18bff414e210f174008/packages/core/src/utils/maskTypename.ts
// eslint-disable-next-line  @typescript-eslint/no-explicit-any
const maskTypename = (data: any, isRoot?: boolean): any => {
	if (!data || typeof data !== 'object') {
	  return data;
	} else if (Array.isArray(data)) {
	  return data.map(d => maskTypename(d));
	} else if (
	  data &&
	  typeof data === 'object' &&
	  (isRoot || '__typename' in data)
	) {
		// eslint-disable-next-line  @typescript-eslint/no-explicit-any
	  const acc: { [key: string]: any } = {};
	  for (const key in data) {
		if (key === '__typename') {
		  Object.defineProperty(acc, '__typename', {
			enumerable: false,
			value: data.__typename,
		  });
		} else {
		  acc[key] = maskTypename(data[key]);
		}
	  }
	  return acc;
	} else {
	  return data;
	}
  };

export {createClient};