<script lang="ts">
	import { useNavigate, useLocation } from "svelte-navigator";
	import type { CognitoUser } from "amazon-cognito-identity-js";
	import { userPool } from "../auth/cognito";
	import { setAccount } from "../stores/account";

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
