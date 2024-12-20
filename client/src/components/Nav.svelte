<script lang="ts">
	import TopNav from './TopNav.svelte';
	import Hamburger from './Hamburger.svelte';
	import NavMenu from './NavMenu.svelte';
	import NavMask from './NavMask.svelte';
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
	import { activeNav } from '../stores/activeNav';
	import { get } from 'svelte/store';
	let isNavActive = $state(get(activeNav));
	activeNav.subscribe((value) => {
		isNavActive = value;
	});
</script>

<div class="private">
	<TopNav />
	{@render children()}
	{#if isNavActive}
		<NavMask />
		<NavMenu />
	{/if}
	<Hamburger />
</div>

<style>
	.private {
		padding: 0;
		margin: 0 auto;
		border: 0;
		max-width: 50%;
		text-align: unset;
	}
</style>
