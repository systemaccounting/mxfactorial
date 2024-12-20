<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		switchButtons: boolean;
		dataId: string;
		left: Snippet;
		right: Snippet;
	}
	let { switchButtons = $bindable(), dataId, left, right }: Props = $props();
	import { switchRecipient } from '../stores/requestCreate';

	function handleLeftButtonClick(): void {
		switchButtons = false;
		switchRecipient();
	}

	function handleRightButtonClick(): void {
		switchButtons = true;
		switchRecipient();
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
		box-shadow: 9px 9px 9px 1px rgba(92, 92, 95, 0.2);
	}

	button {
		font-size: medium;
		height: 100%;
		margin: 0;
		border: 0;
		padding: 0;
		float: left;
		width: 50%;
		color: white;
	}

	button:first-child {
		border-radius: 4px 0 0 4px;
	}

	button:last-child {
		border-radius: 0 4px 4px 0;
	}

	.active {
		background-color: #005396;
	}

	.inactive {
		background-color: rgb(202, 201, 201);
	}
</style>
