<script lang="ts">
	import TopNav from "./TopNav.svelte";
	import Hamburger from "./Hamburger.svelte";
	import NavMenu from "./NavMenu.svelte";
	import NavMenuDev from "./NavMenuDev.svelte";
	import NavMask from "./NavMask.svelte";
	let isActive: boolean = false;
</script>

<div class="private">
	<TopNav />
	<slot />
	{#if isActive}
		<NavMask bind:isActive />
		{#if process.env.CLIENT_ID && process.env.POOL_ID}
			<NavMenu bind:isActive />
		{:else}
			<NavMenuDev bind:isActive />
		{/if}
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
