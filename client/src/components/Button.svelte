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
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		color: rgba(255, 255, 255, 0.8);
		text-shadow: var(--text-raised);
		transition: all 0.2s ease;
		cursor: pointer;
	}

	button:hover:not([disabled]) {
		filter: brightness(1.1);
		box-shadow: var(--shadow-hover);
	}

	button:active:not([disabled]) {
		filter: brightness(0.95);
		box-shadow: var(--shadow-active);
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
