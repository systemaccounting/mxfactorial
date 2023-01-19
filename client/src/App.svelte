<script lang="ts">
	import MobileLayout from "./containers/MobileLayout.svelte";
	import { Router, Route } from "svelte-navigator";
	import Nav from "./components/Nav.svelte";
	import Public from "./containers/Public.svelte";
	import TestForDevEnv from "./containers/TestForDevEnv.svelte";
	import Home from "./routes/Home.svelte";
	import Requests from "./routes/Requests.svelte";
	import RequestDetail from "./routes/RequestDetail.svelte";
	import History from "./routes/History.svelte";
	import HistoryDetail from "./routes/HistoryDetail.svelte";
	import { getTransactionById } from "./utils/transactions";
	import RequestsUrql from "./containers/RequestsUrql.svelte";
	import HistoryUrql from "./containers/HistoryUrql.svelte";
</script>

<Router primary={false}>
	<MobileLayout>
		<Route path="/">
			<Public />
		</Route>
		<TestForDevEnv>
			<Route path="account">
				<Nav>
					<Home />
				</Nav>
			</Route>
			<Route path="requests/*">
				<RequestsUrql let:requests>
					<Route path="/">
						<Nav>
							<Requests {requests} />
						</Nav>
					</Route>

					<Route path=":id" let:params>
						<Nav>
							<RequestDetail
								request={getTransactionById(
									params.id,
									requests
								)}
							/>
						</Nav>
					</Route>
				</RequestsUrql>
			</Route>
			<Route path="history/*">
				<HistoryUrql let:transactions>
					<Route path="/">
						<Nav>
							<History {transactions} />
						</Nav>
					</Route>
					<Route path=":id" let:params>
						<Nav>
							<HistoryDetail
								transaction={getTransactionById(
									params.id,
									transactions
								)}
							/>
						</Nav>
					</Route>
				</HistoryUrql>
			</Route>
		</TestForDevEnv>
	</MobileLayout>
</Router>
