<script>
	import Landing from "../routes/Landing.svelte";
	import LandingDev from "../routes/LandingDev.svelte";
</script>

{#if process.env.CLIENT_ID && process.env.POOL_ID}
	<Landing />
{:else}
	<LandingDev />
{/if}
