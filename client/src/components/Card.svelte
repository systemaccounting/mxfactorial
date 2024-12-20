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
		border-radius: 4px;
		padding: 8px;
		margin: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		box-shadow: 9px 9px 9px 1px rgba(92, 92, 95, 0.2);
		font-family: Sans-Serif;
		background-color: rgb(255, 255, 255);
	}
</style>
