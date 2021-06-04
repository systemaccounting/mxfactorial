import c from '../constants'
import type { ITransactionItem } from "../index.d"

export default function (transactionItems: ITransactionItem[]): string[] {
	let nullCount = 0;
	let trueCount = 0;
	let falseCount = 0;
	for (const a of transactionItems) {
		if (a.debitor_first == null) {
			nullCount++;
		};
		if (a.debitor_first == true) {
			trueCount++;
		};
		if (a.debitor_first == false) {
			falseCount++;
		};
	};
	if (falseCount == transactionItems.length) {
		const noRef = [...c.SEQUENCE];
		return noRef.reverse();
	}
	if (
		(nullCount != transactionItems.length)
		&& (trueCount != transactionItems.length)
		&& (falseCount != transactionItems.length)
	) {
		throw new Error(c.INCONSISTENT_SEQUENCE_ERROR);
	};
	return c.SEQUENCE;
};