import c from "../constants";
import type { Client, QueryResult } from "pg"
import ACCOUNT_PROFILE_SQL from "../sql/selectAccountProfile"
import STATE_NAME_TRS_SQL from "../sql/selectStateNameTrs"
import ACCOUNT_ROLE_TRS_SQL from "../sql/selectAccountRoleTrs"

export default async function (db: Client, roleName: string, accountName: string) {
	const accountProfile: QueryResult = await db.query(
		ACCOUNT_PROFILE_SQL, [accountName]
	);
	const rulesPerStateName: QueryResult = await db.query(
		STATE_NAME_TRS_SQL,
		[c.TRANSACTION_ITEM, roleName, accountProfile.rows[0].state_name]
	);
	const rulesPerAccountRole: QueryResult = await db.query(
		ACCOUNT_ROLE_TRS_SQL,
		[c.TRANSACTION_ITEM, roleName, accountName]
	);
	// todo: handle error
	return [...rulesPerAccountRole.rows, ...rulesPerStateName.rows];
};