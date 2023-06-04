<script lang="ts">
	import RULES_QUERY from '../graphql/query/rules';
	import { addRuleItems } from '../stores/requestCreate';
	import type { Client } from '@urql/core';
	import { getContext } from 'svelte';
	import c from '../utils/constants'

	export let reqItems: App.ITransactionItem[];

	const client: Client = getContext(c.CLIENT_CTX_KEY);

	client
		.query(RULES_QUERY, { transaction_items: reqItems })
		.toPromise()
		.then((ruleItems) => {
			if (ruleItems.data) {
				addRuleItems(ruleItems.data.rules.transaction_items);
			} else {
				addRuleItems([]);
			}
		})
		.catch((e) => console.error(e));
</script>
