<script>
	import Private from "./Private.svelte";
	import PrivateDev from "./PrivateDev.svelte";
</script>

{#if process.env.CLIENT_ID && process.env.POOL_ID}
	<Private>
		<slot />
	</Private>
{:else}
	<PrivateDev>
		<slot />
	</PrivateDev>
{/if}
