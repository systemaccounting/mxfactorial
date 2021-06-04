import c from "../constants"
import ACCOUNT_ROLE_TRS_SQL from "../sql/selectAccountRoleTrs"
import type { Client } from "pg"
import type { IRuleInstance } from "../index.d"

export default async function (
	db: Client,
	roleName: string,
	approverName: string,
): Promise<IRuleInstance[]> {

	// rows.length == 0 ok
	const { rows } = await db.query(
		ACCOUNT_ROLE_TRS_SQL,
		[c.APPROVAL, roleName, approverName]
	);
	// todo: handle error
	return rows;
};