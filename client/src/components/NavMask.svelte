<script lang="ts">
	import { switchActiveNav } from '../stores/activeNav';

	function handleEvent(e: Event): void {
		e.preventDefault();
		switchActiveNav();
	}
</script>
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="nav-mask" onclick={handleEvent}></div>

<svelte:window onkeypress={handleEvent} />

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
