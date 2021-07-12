import c from "../constants"
import ACCOUNT_ROLE_TRS_SQL from "../sql/selectAccountRoleTrs"
import type { IRuleInstance, IPGClient } from "../index.d"

export default async function (
	client: IPGClient,
	roleName: string,
	approverName: string,
): Promise<IRuleInstance[]> {

	// rows.length == 0 ok
	const { rows } = await client.query(
		ACCOUNT_ROLE_TRS_SQL,
		[c.APPROVAL, roleName, approverName]
	);
	// todo: handle error
	return rows;
};