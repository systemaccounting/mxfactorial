<script lang="ts">
	import { Link } from "svelte-navigator";
	import { useNavigate, useLocation } from "svelte-navigator";
	import { signOut } from "../auth/cognito";

	export let isActive: boolean;

	const navigate = useNavigate();
	const location = useLocation();

	function handleDisplayClick(): void {
		isActive = !isActive;
	}

	function handleSignOutClick() {
		signOut();
		navigate("/", {
			state: { from: $location.pathname },
			replace: true,
		});
	}
</script>

<div on:click|preventDefault={handleDisplayClick}>
	<ul data-id="nav-menu">
		<Link to="/requests">
			<li data-id="nav-menu-item">Requests</li>
		</Link>
		<Link to="/history">
			<li data-id="nav-menu-item">History</li>
		</Link>
		<li data-id="nav-menu-item">Rules</li>
		<li data-id="nav-menu-item">Query</li>
		<li data-id="nav-menu-item">Support</li>
		<li
			data-name="sign-out"
			data-id="nav-menu-item"
			on:click|preventDefault={handleSignOutClick}
		>
			Sign Out
		</li>
	</ul>
</div>

<style>
	ul {
		margin: 0.5rem 1rem 0 0;
		padding: 0;
		max-height: 100%;
		overflow-y: scroll;
		position: fixed;
		right: 0.5rem;
		bottom: 6rem;
		z-index: 100;
		display: flex;
		flex-flow: column nowrap;
		justify-content: flex-end;
		list-style-type: none;
	}

	li {
		padding: 0.5rem;
		margin: 0.3rem 0 0 0;
		font-size: 1.2rem;
		color: rgb(115, 162, 194);
		background-color: white;
		border-style: solid;
		border-width: 0.5px;
		border-radius: 3px;
		border-color: rgb(236, 236, 240);
		text-align: right;
		box-shadow: -7px 7px 9px 1px rgba(92, 92, 95, 0.3);
		cursor: pointer;
	}
</style>
