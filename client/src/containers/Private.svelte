<script lang="ts">
	import { initClient } from "@urql/svelte";
	import { useNavigate, useLocation } from "svelte-navigator";
	import type { CognitoUser } from "amazon-cognito-identity-js";
	import { userPool } from "../auth/cognito";
	import { setAccount } from "../stores/account";

	const apiResource: string = "query";
	const url: string =
		atob(process.env.GRAPHQL_API).trim() + "/" + apiResource;

	initClient({ url, maskTypename: true });

	const navigate = useNavigate();
	const location = useLocation();

	var cognitoUser: CognitoUser = userPool.getCurrentUser();

	let account: string;

	try {
		account = cognitoUser.getUsername();
		setAccount(account);
	} catch (e) {
		navigate("/", {
			state: { from: $location.pathname },
			replace: true,
		});
	}
</script>

<slot />
