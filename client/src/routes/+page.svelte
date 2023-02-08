<script>
	import Landing from '../containers/Landing.svelte';
	import LandingDev from '../containers/LandingDev.svelte';
</script>

<svelte:head>
	<title>mxfactorial</title>
	<meta name="mxfactorial" content="demo client" />
</svelte:head>

{#if !process.env.CLIENT_ID && !process.env.POOL_ID}
	<LandingDev />
{:else}
	<Landing />
{/if}
