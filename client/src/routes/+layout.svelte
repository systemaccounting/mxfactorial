<script lang="ts">
	import MobileLayout from '../containers/MobileLayout.svelte';
	import { page } from '$app/stores';
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

{#if $page.url.pathname !== '/measure'}
	<MobileLayout {children} />
{:else}
	{@render children()}
{/if}