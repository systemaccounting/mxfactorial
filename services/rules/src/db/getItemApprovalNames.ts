import APPROVAL_SQL from "../sql/selectApproval"
import type { IPGClient } from "../index.d"

export default async function (
	client: IPGClient,
	accountName: string,
) {
	const { rows } = await client.query(APPROVAL_SQL, [accountName]);

	// todo: handle errors

	if (!rows.length) {
		return [];
	};

	const itemApproverNames: string[] = rows.map(x => x.approver);

	return itemApproverNames;
};