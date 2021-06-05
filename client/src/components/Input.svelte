<script lang="ts">
	// insertId enables any parent component to discover
	// which input component is sending an insert event
	export let insertId: string;
	export let hasError: boolean;
	export let placeholder: string;
	export let value: string;
	export let disabled: boolean = false;
	import type { IInsertValueId } from "../main.d";
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher<{ insert: IInsertValueId }>();

	function handleInsert(e: Event) {
		const input = e.target as HTMLInputElement;
		dispatch("insert", {
			id: insertId,
			value: input.value,
		});
	}
</script>

<div class="container">
	<input
		data-id-insert={insertId}
		{placeholder}
		bind:value
		class="field {hasError ? 'error' : null}"
		on:input={handleInsert}
		{disabled}
	/>
</div>

<style>
	.container {
		margin: 0;
		padding: 0;
		border: 0;
		width: 100%;
	}

	.field {
		height: 2.5rem;
		width: 100%;
		text-align: center;
		border-radius: 3px;
		margin-bottom: 1rem;
		font-size: 1.25rem;
		box-shadow: 9px 9px 9px 1px rgba(92, 92, 95, 0.2);
		background-color: rgb(255, 255, 255);
		cursor: cursor;
		margin: 0 0 0.5rem 0;
		padding: 0;
		border: 0;
	}

	.field::-webkit-input-placeholder {
		color: rgb(131, 131, 131);
	}

	.field:focus::-webkit-input-placeholder {
		color: transparent;
		outline: none;
	}

	.error {
		color: red;
	}
</style>
