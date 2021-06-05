import type { ITransactionItem } from "../index.d"

export default function (transactionItems: ITransactionItem[]): string {
	let sumValue = 0;
	for (let i = 0; i < transactionItems.length; i++) {
		const itemPrice = parseFloat(transactionItems[i].price)
		const itemQuantity = parseFloat(transactionItems[i].quantity)
		const itemValue = itemPrice * itemQuantity
		sumValue += itemValue
	};
	return sumValue.toFixed(3).toString();
}