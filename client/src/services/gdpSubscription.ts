import { createClient as createWSClient } from 'graphql-ws';
import type { Client } from 'graphql-ws';
import uriBuilder from '../utils/uriBuilder';

export function createGdpSubscription(
	graphqlUri: string | undefined,
	wsResource: string | undefined
) {
	let wsClient: Client;
	let stop = false;
	let messageCount = 0;

	function getMessageCount() {
		return messageCount;
	}

	async function subscribe(
		date: string,
		country: string,
		region: string,
		municipality: string | null,
		onMessage: (value: string) => void
	) {
		if (messageCount) {
			await reset();
		}

		if (!wsResource) {
			console.error('missing PUBLIC_GRAPHQL_WS_RESOURCE');
			return;
		}

		const url = uriBuilder(graphqlUri as string, wsResource as string, false);
		wsClient = createWSClient({ url });

		const variables: Record<string, string> = { date, country, region };
		if (municipality) {
			variables.municipality = municipality;
		}

		const subscription = wsClient.iterate({
			query: `subscription QueryGdp($date: String!, $country: String, $region: String, $municipality: String) {
				queryGdp(date: $date, country: $country, region: $region, municipality: $municipality)
				}`,
			variables
		});

		for await (const { data } of subscription) {
			if (stop) {
				stop = false;
				break;
			}
			if (data && typeof data.queryGdp === 'number') {
				onMessage(data.queryGdp.toFixed(3));
				messageCount++;
			}
		}
	}

	async function reset() {
		stop = true;
		while (stop) {
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
		messageCount = 0;
	}

	return { subscribe, reset, getMessageCount };
}
