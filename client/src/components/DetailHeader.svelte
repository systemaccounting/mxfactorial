<script lang="ts">
	import type { Snippet } from 'svelte';
	interface Props {
		left: Snippet;
		middle: Snippet;
		right: Snippet;
	}
	let {
		left,
		middle,
		right
	}: Props = $props();
</script>

<div>
	<span>
		{@render left()}
	</span>
	<span>
		{@render middle()}
	</span>
	<span>
		{@render right()}
	</span>
</div>

<style>
	div {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: #efefef;
		margin: 0 0 1rem 0;
	}

	span {
		text-align: center;
	}
</style>
