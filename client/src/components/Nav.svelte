<script lang="ts">
	import TopNav from './TopNav.svelte';
	import Hamburger from './Hamburger.svelte';
	import NavMenu from './NavMenu.svelte';
	import type { Snippet } from 'svelte';
	interface Props {
		children: Snippet;
		onreset?: () => void;
	}
	let { children, onreset }: Props = $props();

	let isOpen = $state(false);
	function toggle() {
		isOpen = !isOpen;
	}

	function handleWindowClick() {
		if (isOpen) {
			isOpen = false;
		}
	}
</script>

<svelte:window onclick={handleWindowClick} />

<div class="private">
	<TopNav {onreset} />
	{@render children()}
	{#if isOpen}
		<NavMenu {toggle} />
	{/if}
	<Hamburger {isOpen} {toggle} />
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
