<script lang="ts">
	import { signUp, signIn } from '../auth/cognito';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let hasError: boolean = false;
	let disabled: boolean = false;
	let inactive: boolean = false;
	let account: string = '';
	let password: string = '';

	async function handleSignIn(e: Event) {
		e.preventDefault();
		try {
			await signIn(
				page.data.poolId,
				page.data.clientId,
				document.location.hostname,
				account,
				password
			);
		} catch (err) {
			alert(err);
		}
		goto('/account');
	}

	async function handleSignUp() {
		try {
			await signUp(
				page.data.poolId,
				page.data.clientId,
				document.location.hostname,
				account,
				password
			);
		} catch (err) {
			alert(err);
		}
		goto('/account');
	}
</script>

<div>
	<img src="../images/logo.png" alt="logo" />
	<p>
		demo web client for <a
			href="https://github.com/systemaccounting/mxfactorial"
			target="_blank"
			rel="noopener noreferrer"><i>Mx!</i> platform</a
		>
	</p>
	<form onsubmit={handleSignIn}>
		<input placeholder="account" name="account" bind:value={account} />
		<input
			placeholder="password"
			name="password"
			type="password"
			class:hasError
			bind:value={password}
		/>
		<button
			class="base-button primary"
			data-id="signInButton"
			class:disabled
			class:inactive
			type="submit">Sign In</button
		>
		<button
			class="base-button create-account"
			class:disabled
			class:inactive
			data-id="createAccountButton"
			type="submit"
			onclick={handleSignUp}>Create</button
		>
	</form>
</div>

<style>
	p {
		color: white;
		font-weight: 400;
	}

	a {
		color: white;
		text-decoration: underline;
	}

	a:visited {
		color: white;
	}

	img {
		max-width: 85%;
	}

	input {
		width: 70%;
		text-align: center;
		border-radius: 3px;
		margin-bottom: 0.75rem;
		height: 2.5rem;
		outline: none;
		border: none;
		font-size: 1.5rem;
		box-shadow: 9px 9px 9px 1px rgba(92, 92, 95, 0.2);
		background-color: white;
		cursor: text;
	}

	input:focus {
		color: rgb(131, 131, 131);
	}

	input.hasError {
		color: red;
	}

	input:focus::-webkit-input-placeholder {
		color: transparent;
	}

	.base-button {
		width: 70%;
		text-align: center;
		padding: 0;
		border-radius: 3px;
		margin-bottom: 0.75rem;
		height: 2.9rem;
		outline: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		transition: 0.2s;
		align-items: center;
		justify-content: center;
		box-shadow: 9px 9px 9px 1px rgba(92, 92, 95, 0.2);
	}

	.base-button.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.base-button.inactive {
		background-color: rgb(202, 201, 201) !important;
		color: rgb(238, 235, 235);
	}

	.primary {
		background-color: #005396;
		color: white;
	}

	.create-account {
		background-color: rgb(0, 153, 230);
		color: white;
	}
</style>
