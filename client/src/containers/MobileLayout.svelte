<script lang="ts">
	import '../app.css';
	import Storage from './Storage.svelte';
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<Storage>
	<div class="mobile-layout">
		{@render children()}
	</div>
</Storage>

<style>
	.mobile-layout {
		text-align: center;
		max-width: 400px;
		margin: auto;
		padding: 1.5rem 0 1rem 0;
		border: 0;
		justify-content: center;
		box-sizing: border-box;
	}
</style>
