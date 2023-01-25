<script>
	import Private from "./Private.svelte";
</script>

{#if process.env.CLIENT_ID && process.env.POOL_ID}
	<Private>
		<slot />
	</Private>
{:else}
	<slot />
{/if}
