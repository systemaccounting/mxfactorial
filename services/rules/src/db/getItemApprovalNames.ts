import c from "../constants";
import type { Client } from "pg"
import APPROVAL_SQL from "../sql/selectApproval"

export default async function (
	db: Client,
	accountName: string,
) {
	const { rows } = await db.query(APPROVAL_SQL, [accountName]);

	// todo: handle more errors
	if (!rows.length) {
		throw new Error(c.APPROVAL_COUNT_ERROR);
	};

	const itemApproverNames: string[] = rows.map(x => x.approver);
	return itemApproverNames;
};