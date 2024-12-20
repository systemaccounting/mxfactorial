<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		disabled: boolean;
		class: string;
		children: Snippet;
	}
	let {
		disabled = false,
		class: klass,
		children
	}: Props = $props();
</script>

<div>
	<button {disabled} class={klass}>
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
	}
	div {
		margin: 0;
		border: 0;
		padding: 0;
	}
</style>
