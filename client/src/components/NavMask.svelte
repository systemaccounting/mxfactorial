<script lang="ts">
	interface Props {
		toggle: () => void;
	}
	let { toggle }: Props = $props();

	function handleEvent(e: Event): void {
		e.preventDefault();
		toggle();
	}
</script>

<div class="nav-mask" onclick={handleEvent} role="presentation"></div>

<svelte:window onkeypress={handleEvent} />

<style>
	.nav-mask {
		position: fixed;
		width: 100vw;
		height: 100vh;
		background-color: var(--color-mask);
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
