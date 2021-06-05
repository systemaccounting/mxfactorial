<script lang="ts">
	import { Link, useLocation } from "svelte-navigator";
	import Icon from "../icons/Icon.svelte";
	import { faHome, faFlag } from "@fortawesome/free-solid-svg-icons";
	import request from "../stores/request";

	const location = useLocation();

	function handleReset() {
		if ($location.pathname == "/account") {
			request.reset();
		}
	}
</script>

<div data-id="topNav">
	<Link to="/account" replace={true}>
		<span on:click={handleReset}>
			<Icon
				addedStyle="float: left;"
				iconName={faHome}
				dataIDValue="homeIcon"
			/>
		</span>
	</Link>
	<Icon
		addedStyle="width: 2.5rem;"
		iconName={faFlag}
		dataIDValue="notificationIcon"
	/>
</div>

<style>
	div {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: left;
		color: #efefef;
		margin: 0 0 1rem 0;
		border: 0;
		padding: 0;
	}
</style>
