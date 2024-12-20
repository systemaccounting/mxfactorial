<script lang="ts">
	import MobileLayout from '../containers/MobileLayout.svelte';
	import client from '../graphql/client';
	import c from '../utils/constants';
	import { setContext } from 'svelte';
	import { page } from '$app/stores';
	setContext(c.CLIENT_CTX_KEY, client);
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

{#if $page.url.pathname !== '/measure'}
	<MobileLayout {children} />
{:else}
	{@render children()}
{/if}