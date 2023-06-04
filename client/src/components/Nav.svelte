<script lang="ts">
	import TopNav from './TopNav.svelte';
	import Hamburger from './Hamburger.svelte';
	import NavMenu from './NavMenu.svelte';
	import NavMask from './NavMask.svelte';
	let isActive: boolean = false;
</script>

<div class="private">
	<TopNav />
	<slot />
	{#if isActive}
		<NavMask bind:isActive />
		<NavMenu bind:isActive />
	{/if}
	<Hamburger bind:isActive />
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
