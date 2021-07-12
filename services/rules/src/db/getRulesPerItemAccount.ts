import c from "../constants";
import type { QueryResult } from "pg"
import type { IPGClient } from "../index.d"
import STATE_NAME_TRS_SQL from "../sql/selectStateNameTrs"
import ACCOUNT_ROLE_TRS_SQL from "../sql/selectAccountRoleTrs"

export default async function (
	client: IPGClient,
	roleName: string,
	stateName: string,
	accountName: string,
) {

	const rulesPerStateName: QueryResult = await client.query(
		STATE_NAME_TRS_SQL,
		[c.TRANSACTION_ITEM, roleName, stateName]
	);

	const rulesPerAccountRole: QueryResult = await client.query(
		ACCOUNT_ROLE_TRS_SQL,
		[c.TRANSACTION_ITEM, roleName, accountName]
	);

	let rules = [
		...rulesPerAccountRole.rows,
		...rulesPerStateName.rows,
	];

	console.log("rules found: ", rules)
	// todo: handle error

	return rules
};