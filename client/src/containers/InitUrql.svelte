<script lang="ts">
	import { initClient } from "@urql/svelte";
	import type { ClientOptions } from "@urql/svelte";
	import { getIdToken } from "../auth/cognito";

	const apiResource: string = "query";
	const url: string =
		atob(process.env.GRAPHQL_URI).trim() + "/" + apiResource;

	let clientOpts: ClientOptions = {
		url,
		maskTypename: true,
		fetchOptions: {
			credentials: "same-origin",
		},
	};

	if (process.env.ENABLE_AUTH == "true") {
		getIdToken(function (idToken) {
			clientOpts.fetchOptions = {
				...clientOpts.fetchOptions,
				headers: {
					Authorization: idToken,
				},
			};
		});
	}

	initClient(clientOpts);
</script>

<slot />
