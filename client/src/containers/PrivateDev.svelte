<script lang="ts">
	import { initClient } from "@urql/svelte";

	const apiResource: string = "query";
	const url: string =
		atob(process.env.GRAPHQL_URI).trim() + "/" + apiResource;

	initClient({ url, maskTypename: true });
</script>

<slot />
