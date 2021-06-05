<script lang="ts">
	export let size: number;
	export let style: string;
</script>

<svg {style} viewBox="0 0 1024 1024" width={size} height={size}>
	<path
		fill="currentColor"
		d="M992 384h-352v-352c0-17.672-14.328-32-32-32h-192c-17.672 0-32 14.328-32 32v352h-352c-17.672 0-32 14.328-32 32v192c0 17.672 14.328 32 32 32h352v352c0 17.672 14.328 32 32 32h192c17.672 0 32-14.328 32-32v-352h352c17.672 0 32-14.328 32-32v-192c0-17.672-14.328-32-32-32z"
	/>
</svg>
