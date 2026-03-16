<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		minHeight?: string;
		class?: string;
		children: Snippet;
	}
	let { minHeight = '3rem', class: klass, children }: Props = $props();
</script>

<div style="min-height: {minHeight};" class={klass ? klass : ''}>
	{@render children()}
</div>

<style>
	div {
		border-radius: var(--radius);
		padding: 8px;
		margin: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		box-shadow:
			1px 2px 4px var(--bevel-shadow),
			-1px -1px 2px var(--bevel-light);
		background-color: rgba(255, 255, 255, 0.12);
	}
</style>
