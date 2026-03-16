<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		switchButtons: boolean;
		dataId: string;
		left: Snippet;
		right: Snippet;
		onswitch?: () => void;
	}
	let { switchButtons = $bindable(), dataId, left, right, onswitch }: Props = $props();

	function handleLeftButtonClick(): void {
		switchButtons = false;
		onswitch?.();
	}

	function handleRightButtonClick(): void {
		switchButtons = true;
		onswitch?.();
	}
</script>

<div data-id={dataId} class="group">
	<button onclick={handleLeftButtonClick} class={switchButtons ? 'inactive' : 'active'}>
		{@render left()}
	</button>
	<button onclick={handleRightButtonClick} class={switchButtons ? 'active' : 'inactive'}>
		{@render right()}
	</button>
</div>

<style>
	.group {
		margin: 0;
		border: 0;
		padding: 0;
		height: 2.25rem;
		box-shadow: var(--shadow);
	}

	button {
		font-size: medium;
		height: 100%;
		margin: 0;
		border: 0;
		padding: 0;
		float: left;
		width: 50%;
		color: rgba(255, 255, 255, 0.8);
		text-shadow: var(--text-raised);
	}

	button:first-child {
		border-radius: var(--radius) 0 0 var(--radius);
	}

	button:last-child {
		border-radius: 0 var(--radius) var(--radius) 0;
	}

	.active {
		background-color: rgba(40, 90, 150, 0.6);
	}

	.inactive {
		background-color: rgba(150, 170, 190, 0.2);
		color: rgba(255, 255, 255, 0.5);
	}
</style>
