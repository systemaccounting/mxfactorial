<script lang="ts">
	export let isActive: boolean;

	function handleEvent(): void {
		isActive = !isActive;
	}
</script>

<div class="nav-mask" on:click|preventDefault={handleEvent} />

<svelte:window on:keypress={handleEvent} />

<style>
	.nav-mask {
		position: fixed;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.3);
		transition: 0.2s;
		transition-delay: 0.2s;
		margin: 0 auto;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		text-align: center;
		opacity: 1;
		display: block;
	}
</style>
