<script lang="ts">
	interface Props {
		size: number;
		style: string;
	}
	let { size, style }: Props = $props();
</script>

<svg {style} viewBox="0 0 1024 1024" width={size} height={size}>
	<path
		fill="currentColor"
		d="M0 416v192c0 17.672 14.328 32 32 32h960c17.672 0 32-14.328 32-32v-192c0-17.672-14.328-32-32-32h-960c-17.672 0-32 14.328-32 32z"
	/>
</svg>
