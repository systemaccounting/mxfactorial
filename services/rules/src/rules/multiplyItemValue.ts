import { ANY } from "./tokens";
import { stringIfNull, stringIfNumber, numberToFixedString } from "./shared";
import type { ITransactionItem } from "../index.d";
import emptyTransactionItem from "../initial/transactionItem.json";

export default function (
	ruleInstanceId: string,
	ruleName: string,
	ruleAccountRole: string,
	ruleAccountName: string,
	transactionItem: ITransactionItem,
	DEBITOR: string,
	CREDITOR: string,
	ITEM_NAME: string,
	FACTOR: string,
): ITransactionItem[] {

	// multiply price * quantity * FACTOR, e.g. tax rate
	const addedItemValue = parseFloat(transactionItem.price) * parseFloat(FACTOR);
	const addedItemQuantity = parseFloat(transactionItem.quantity);

	// ok to repeat after passing testDebitorFirstValues()
	const repeatedTransactionSequence = transactionItem.debitor_first;
	const repeatedUnitOfMeasurement = transactionItem.unit_of_measurement;
	const repeatedUnitsMeasured = transactionItem.units_measured;

	// standard types
	const ruleInstID = stringIfNumber(stringIfNull(ruleInstanceId))

	// create vars for values affected by keywords
	const trsDebitor = DEBITOR == ANY ? transactionItem.debitor : DEBITOR
	const trsCreditor = CREDITOR == ANY ? transactionItem.creditor : CREDITOR

	const addedItem: ITransactionItem = {
		...emptyTransactionItem,
		...{
			item_id: ITEM_NAME,
			price: numberToFixedString(addedItemValue),
			quantity: numberToFixedString(addedItemQuantity),
			debitor_first: repeatedTransactionSequence,
			rule_instance_id: ruleInstID,
			unit_of_measurement: repeatedUnitOfMeasurement,
			units_measured: repeatedUnitsMeasured,
			debitor: trsDebitor,
			creditor: trsCreditor,
		},
	};

	if (transactionItem.rule_instance_id && transactionItem.rule_instance_id == ruleInstanceId) {
		return []; // avoid dupe
	}

	return [addedItem]; // rules may return added.length > 1
};