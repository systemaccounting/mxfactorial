<script lang="ts">
	import RULES_QUERY from '../query/rules';
	import request from '../stores/request';
	import type { Client } from '@urql/core';
	import { getContext } from 'svelte';

	export let reqItems: App.ITransactionItem[];

	const client: Client = getContext('client');

	client
		.query(RULES_QUERY, { transaction_items: reqItems })
		.toPromise()
		.then((ruleItems) => {
			request.addRuleItems(ruleItems.data.rules.transaction_items);
		})
		.catch((e) => console.error(e));
</script>
