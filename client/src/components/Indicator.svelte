<script lang="ts">
	interface Props {
		hasError?: boolean;
		value: string;
		placeholder: string;
	}
	let { hasError, value, placeholder }: Props = $props();
</script>

<div class="container">
	<input
		{placeholder}
		{value}
		class="indicator {hasError ? 'error' : null}"
		disabled
	/>
</div>

<style>
	.container {
		margin: 0;
		padding: 0;
		border: 0;
		width: 100%;
	}

	.indicator {
		height: 2.5rem;
		width: 100%;
		text-align: center;
		border-radius: 3px;
		margin-bottom: 1rem;
		font-size: 1.25rem;
		box-shadow: 9px 9px 9px 1px rgba(92, 92, 95, 0.2);
		background-color: rgb(255, 255, 255);
		cursor: default;
		margin: 0 0 0.5rem 0;
		padding: 0;
		border: 0;
	}

	.indicator::-webkit-input-placeholder {
		color: rgb(131, 131, 131);
	}

	.error {
		color: red;
	}
</style>
