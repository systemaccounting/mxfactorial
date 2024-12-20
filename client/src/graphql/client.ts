import { createClient, cacheExchange, fetchExchange, mapExchange } from '@urql/core';
import type { ClientOptions } from '@urql/core';
import { getIdToken } from '../auth/cognito';
import b64 from 'base-64';
import buildUri from '../utils/uriBuilder';

const apiResource = 'query';

const relativeUri: string = b64.decode(process.env.GRAPHQL_URI as string)?.trim() + '/' + apiResource;

const uri: string = buildUri(relativeUri);

const clientOpts: ClientOptions = {
	url: uri,
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

export default createClient(clientOpts)