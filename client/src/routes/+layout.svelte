<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();

	let isMeasure = $derived($page.url.pathname === '/measure');
</script>

<svelte:head>
	{#if isMeasure}
		<style>
			html {
				background-image: none;
				background-color: white;
			}
		</style>
	{/if}
</svelte:head>

{#if !isMeasure}
	<div class="mobile-layout">
		{@render children()}
	</div>
{:else}
	{@render children()}
{/if}

<style>
	.mobile-layout {
		text-align: center;
		max-width: 400px;
		margin: auto;
		padding: 1.5rem 0 1rem 0;
		border: 0;
		justify-content: center;
		box-sizing: border-box;
	}
</style>
