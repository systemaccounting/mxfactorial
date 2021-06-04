import type { ITransactionItem, IIntraTransaction } from "./index.d"
import c from "./constants"
import db from "./db/index"
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

// connecting to db outside of handler
// avoids recreating connections in lambda
; (async () => await db.connect())();

export async function handler(event: ITransactionItem[]): Promise<IIntraTransaction | string> {

	// console.log(event)
	if (!Object.keys(event).length) {
		console.log('0 items received...');
		return null;
	}

	// user wants DEBITOR or CREDITOR processed first
	let transactionSequence;
	try {
		transactionSequence = testDebitorFirstValues(event);
	} catch (e) {
		// Error: inconsistent debitor_first values
		const errMsg = "testDebitorFirstValues: " + e.message
		console.log(errMsg)
		return errMsg;
	}

	// add approvals property to each transaction item received in event
	const eventWithApprovals: ITransactionItem[] = event.map(x => ({
		...x,
		approvals: new Array(),
	}))

	// get item rules from db, then create items from rules
	let addedItems;
	try {
		addedItems = await addRuleItems(
			transactionSequence,
			db,
			eventWithApprovals,
			getRulesPerItemAccount,
			applyItemRules,
		);
	} catch (e) {
		await db.end(); // if process.env.PG_DISCONNECT=true
		const errMsg = "addRuleItems: " + e.message;
		console.log(errMsg);
		return errMsg;
	};

	if (addedItems.length == 0) {
		console.log("rules not found");
	}

	// combine rule added items to items received in event
	const ruleAppliedItems: ITransactionItem[] = [...addedItems, ...eventWithApprovals];

	// get approvals & rules from db, then apply to items
	let ruleAppliedApprovals;
	try {
		ruleAppliedApprovals = await addApprovalsAndRules(
			transactionSequence,
			db,
			ruleAppliedItems,
			getItemApprovalNames,
			getRulesPerApproval,
			applyApprovalRules,
		);
	} catch (e) {
		await db.end(); // if process.env.PG_DISCONNECT=true

		// Error: approvals not found
		const errMsg = "addApprovalsAndRules: " + e.message;
		console.log(errMsg);

		// return original event if 0 item and approval rules applied
		if (addedItems.length == 0 && e.message == c.APPROVAL_COUNT_ERROR) {
			return createResponse(event);
		};

		return errMsg;
	};

	// let db go if process.env.PG_DISCONNECT=true
	await db.end();

	// label rule approved transaction items
	let labeledApproved
	try {
		labeledApproved = labelApprovedItems(
			ruleAppliedApprovals,
			transactionSequence,
		);
	} catch (e) {
		const errMsg = "labelApprovedItems: " + e.message;
		console.log(errMsg);

		// return original event
		return createResponse(ruleAppliedItems);
	}

	// debug logging
	// console.log(resp);
	// for (const i of resp.transaction.transaction_items) {
	// 	console.log(i);
	// };

	return createResponse(labeledApproved);
};