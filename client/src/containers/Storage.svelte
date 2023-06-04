<script lang="ts">
	// temp save stores locally until
	// session management added
	// https://gist.github.com/stevesob/f25e54418369a24dd7d3907d9094ed91#file-app-svelte
	import { onMount } from 'svelte';
	import { account } from '../stores/account';
	import { requestCreate } from '../stores/requestCreate';
	import { requestsPending } from '../stores/requestsPending';
	import { history } from '../stores/history';
	import c from '../utils/constants';
	let save = false;

	$: if (save && $account) {
		window.localStorage.setItem(c.ACCOUNT_KEY, JSON.stringify($account));
	}

	$: if (save && $requestCreate) {
		window.localStorage.setItem(c.REQUEST_CREATE_KEY, JSON.stringify($requestCreate));
	}

	$: if (save && $requestsPending) {
		window.localStorage.setItem(c.REQUESTS_PENDING_KEY, JSON.stringify($requestsPending));
	}

	$: if (save && $history) {
		window.localStorage.setItem(c.HISTORY_KEY, JSON.stringify(history));
	}

	onMount(async () => {
		let accountSes = window.localStorage.getItem(c.ACCOUNT_KEY);
		if (accountSes) {
			account.set(JSON.parse(accountSes));
		}

		let requestCreateSes = window.localStorage.getItem(c.REQUEST_CREATE_KEY);
		if (requestCreateSes) {
			requestCreate.set(JSON.parse(requestCreateSes));
		}

		let requestsPendingSes = window.localStorage.getItem(c.REQUESTS_PENDING_KEY);
		if (requestsPendingSes) {
			requestsPending.set(JSON.parse(requestsPendingSes));
		}

		let historySes = window.localStorage.getItem(c.HISTORY_KEY);
		if (historySes) {
			history.set(JSON.parse(historySes));
		}

		save = true; // also used to wait for onmount before rendering slot below
	});
</script>

{#if save}
<slot />
{/if}
