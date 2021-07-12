import type { IPGClient, IAccountProfile } from "../index.d"
import type { QueryResult } from "pg"
import ACCOUNT_PROFILE_SQL from "../sql/selectAccountProfile"

export default async function (
	client: IPGClient,
	creditor: string,
	debitor: string,
): Promise<IAccountProfile[]> {

	let creditorProfile: IAccountProfile;

	let creditorResponse: QueryResult = await client.query(
		ACCOUNT_PROFILE_SQL, [creditor],
	);

	// set null if creditor profile not found
	if (!creditorResponse.rows.length) {
		creditorProfile = null;
	} else {
		creditorProfile = creditorResponse.rows[0];
	}

	let debitorProfile: IAccountProfile;

	let debitorResponse: QueryResult = await client.query(
		ACCOUNT_PROFILE_SQL, [debitor],
	);

	// set null if debitor profile not found
	if (!debitorResponse.rows.length) {
		debitorProfile = null;
	} else {
		debitorProfile = debitorResponse.rows[0];
	}

	return [creditorProfile, debitorProfile];
}