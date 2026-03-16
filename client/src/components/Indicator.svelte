<script lang="ts">
	interface Props {
		hasError?: boolean;
		value: string;
		placeholder: string;
	}
	let { hasError, value, placeholder }: Props = $props();
</script>

<div class="container">
	<input {placeholder} {value} class="indicator {hasError ? 'error' : null}" disabled />
</div>

<style>
	.container {
		margin: 0;
		padding: 0;
		border: 0;
		width: 100%;
	}

	.indicator {
		width: 100%;
		cursor: default;
		box-shadow: var(--shadow);
		background-color: rgba(255, 255, 255, 0.12);
	}

	.error {
		color: var(--color-error);
	}
</style>
