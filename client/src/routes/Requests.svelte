<script lang="ts">
	import { Link } from "svelte-navigator";
	import SwitchButtons from "../components/SwitchButtons.svelte";
	import RequestCard from "../components/RequestCard.svelte";
	import {
		duplicateRequestsPerRole,
		isCreditor,
		isRejected,
		requestTime,
		getContraAccount,
	} from "../utils/transactions";
	import { account as currentAccount } from "../stores/account";

	export let requests;
	let isActive: boolean = true;
	let requestsPerRole = duplicateRequestsPerRole($currentAccount, requests);
</script>

<div class="switch">
	<SwitchButtons bind:switchButtons={isActive} dataId="activeRejectedBtns">
		<span slot="left">Rejected</span>
		<span slot="right">Active</span>
	</SwitchButtons>
</div>
<div class="requests">
	<div class="container">
		{#each requestsPerRole.sort((a, b) => {
			if (requestTime(a.transaction_items) < requestTime(b.transaction_items)) {
				return 1;
			}
			return -1;
		}) as req, i}
			{#if isActive}
				{#if !isRejected(req["transaction_items"])}
					<Link to="/requests/{req['id']}">
						<div
							class="container"
							data-id-index={i}
							data-id-req={req["id"]}
						>
							<RequestCard
								contraAccount={getContraAccount(
									$currentAccount,
									req
								)}
								isCurrentAccountAuthor={req["author"] ==
									$currentAccount}
								isCurrentAccountCreditor={isCreditor(
									$currentAccount,
									req["transaction_items"]
								)}
								requestTime={requestTime(
									req["transaction_items"]
								)}
								sumValue={req["sum_value"]}
							/>
						</div>
					</Link>
				{/if}
			{:else if isRejected(req["transaction_items"])}
				<Link to="/requests/{req['id']}">
					<div
						class="container"
						data-id-index={i}
						data-id-req={req["id"]}
					>
						<RequestCard
							contraAccount={$currentAccount == req["author"]
								? $currentAccount
								: req["author"]}
							isCurrentAccountAuthor={req["author"] ==
								$currentAccount}
							isCurrentAccountCreditor={isCreditor(
								$currentAccount,
								req["transaction_items"]
							)}
							requestTime={requestTime(req["transaction_items"])}
							sumValue={req["sum_value"]}
						/>
					</div>
				</Link>
			{/if}
		{/each}
	</div>
</div>

<style>
	.switch {
		padding: 0;
		border: 0;
		margin: 2rem 0 0 0;
	}

	.requests {
		padding: 0;
		border: 0;
		margin: 1.5rem 0 0 0;
	}

	.container {
		padding: 0;
		border: 0;
		margin: 0.7rem 0 0 0;
	}
</style>
