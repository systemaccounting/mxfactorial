import type { ITransactionItem, IIntraTransaction } from "./index.d"
import db from "./db/index"
import getProfiles from "./profiles/getProfiles"
import getRulesPerItemAccount from "./db/getRulesPerItemAccount"
import getItemApprovalNames from "./db/getItemApprovalNames"
import getRulesPerApproval from "./db/getRulesPerApproval"
import addRuleItems from "./transactionItems/addRuleItems"
import applyItemRules from "./transactionItems/applyItemRules"
import addApprovalsAndRules from "./approvals/addApprovalsAndRules"
import applyApprovalRules from "./approvals/applyApprovalRules"
import testDebitorFirstValues from "./response/testDebitorFirstValues"
import createResponse from "./response/createResponse"
import labelApprovedItems from "./transactionItems/labelApprovedItems";

export async function handler(event: ITransactionItem[]): Promise<IIntraTransaction | string> {

	console.log(event)
	if (event == null || !Object.keys(event).length) {
		console.log('0 items received...');
		return null;
	}

	// create global to apply same aproval timestamp
	// to all rule added approvals
	const approvalTime = new Date().toISOString()

	// user wants DEBITOR or CREDITOR processed first
	let transactionSequence;
	try {
		transactionSequence = testDebitorFirstValues(event);
	} catch (e) {
		if (e instanceof Error) {
			// Error: inconsistent debitor_first values
			const errMsg = "testDebitorFirstValues: " + e.message
			console.log(errMsg)
			console.log("responding with unchanged request")
			return createResponse(event);
		}
	}

	// add approvals property to each transaction item received in event
	const eventWithApprovals: ITransactionItem[] = event.map(x => ({
		...x,
		rule_exec_ids: new Array(),
		approvals: new Array(),
	}))

	// get client connection from pool
	const client = await db.connect()

	// get item rules from db, then create items from rules
	let addedItems: ITransactionItem[];
	try {
		addedItems = await addRuleItems(
			transactionSequence,
			client,
			eventWithApprovals,
			getProfiles,
			getRulesPerItemAccount,
			applyItemRules,
		) as ITransactionItem[];
	} catch (e) {
		if (e instanceof Error) {
			await client.release();
			const errMsg = "addRuleItems: " + e.message;
			console.log(errMsg);
			console.log("responding with unchanged request")
			return createResponse(event);
		}
	};

	// combine rule added items to items received in event
	const ruleAppliedItems: ITransactionItem[] = [
		...addedItems,
		...eventWithApprovals,
	];

	// get approvals & rules from db, then apply to items
	let ruleAppliedApprovals;
	try {
		ruleAppliedApprovals = await addApprovalsAndRules(
			transactionSequence,
			client,
			ruleAppliedItems,
			approvalTime,
			getItemApprovalNames,
			getRulesPerApproval,
			applyApprovalRules,
		);
	} catch (e) {
		await client.release();

		if (e instanceof Error) {
			// Error: approvals not found
			const errMsg = "addApprovalsAndRules: " + e.message;
			console.log(errMsg);

			// return unchanged event on error
			console.log("responding with unchanged request");
			return createResponse(event);
		}
	};

	// let db pool connection go
	await client.release();

	// label rule approved transaction items
	let labeledApproved: ITransactionItem[];
	try {
		labeledApproved = labelApprovedItems(
			ruleAppliedApprovals,
			transactionSequence,
			approvalTime,
		) as ITransactionItem[];
	} catch (e) {
		if (e instanceof Error) {
			const errMsg = "labelApprovedItems: " + e.message;
			console.log(errMsg);

			// return rule applied items on error
			return createResponse(ruleAppliedItems);
		};
	}

	// end pool in non lambda environment
	if (process.env.PG_DISCONNECT) {
		await db.end();
	};

	return createResponse(labeledApproved);
};