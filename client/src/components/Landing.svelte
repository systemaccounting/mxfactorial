<script lang="ts">
	import { signUp, signIn } from '../auth/cognito';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
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
		goto(resolve('/account'));
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
		goto(resolve('/account'));
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
			type="submit">sign in</button
		>
		<button
			class="base-button create-account"
			class:disabled
			class:inactive
			data-id="createAccountButton"
			type="submit"
			onclick={handleSignUp}>create</button
		>
	</form>
</div>

<style>
	p {
		color: rgba(255, 255, 255, 0.8);
		font-weight: 400;
		text-shadow: var(--text-raised);
	}

	a {
		color: rgba(255, 255, 255, 0.8);
		text-decoration: underline;
		text-shadow: var(--text-raised);
	}

	a:visited {
		color: rgba(255, 255, 255, 0.8);
	}

	img {
		max-width: 85%;
	}

	input {
		width: 70%;
		font-size: 1.5rem;
		margin-bottom: 0.75rem;
		cursor: text;
		color: rgba(255, 255, 255, 0.8);
		text-shadow: var(--text-raised);
	}

	input.hasError {
		color: var(--color-error);
	}

	.base-button {
		width: 70%;
		text-align: center;
		margin-bottom: 0.75rem;
		height: 2.9rem;
		font-size: 1.5rem;
		background-color: rgba(255, 255, 255, 0.15);
		color: rgba(255, 255, 255, 0.8);
		text-shadow: var(--text-raised);
	}

	.base-button.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.base-button.inactive {
		background-color: var(--color-inactive) !important;
		color: var(--color-inactive-text);
	}

	.primary {
		background-color: rgba(40, 90, 150, 0.75);
	}

	.create-account {
		background-color: rgba(60, 130, 180, 0.65);
	}
</style>
