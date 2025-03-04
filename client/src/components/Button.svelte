<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		disabled: boolean;
		class: string;
		onclick?: () => void;
		children: Snippet;
	}
	let { disabled = false, class: klass, onclick, children }: Props = $props();
</script>

<div>
	<button {disabled} class={klass} {onclick}>
		{@render children()}
	</button>
</div>

<style>
	button {
		font-size: medium;
		height: 100%;
		width: 100%;
		margin: 0 0 0.5rem 0;
		border: 0;
		padding: 0;
		border-radius: 3px;
		box-shadow: 9px 9px 9px 1px rgba(92, 92, 95, 0.2);
		color: white;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	button:hover:not([disabled]) {
		filter: brightness(1.15);
		transform: scale(1.02);
		box-shadow: 10px 10px 10px 2px rgba(92, 92, 95, 0.25);
	}

	button:active:not([disabled]) {
		filter: brightness(0.9);
		transform: scale(0.98);
		box-shadow: 6px 6px 6px 0px rgba(92, 92, 95, 0.15);
	}

	button[disabled] {
		cursor: not-allowed;
		opacity: 0.8;
	}

	div {
		margin: 0;
		border: 0;
		padding: 0;
	}
</style>
