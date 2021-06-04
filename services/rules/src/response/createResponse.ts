import type { ITransaction, ITransactionItem, IIntraTransaction } from "../index.d"
import createSumValue from "./createSumValue"
import emptyTransaction from "../initial/transaction.json"

export default function (transactionItems: ITransactionItem[], authAccount: string = null): IIntraTransaction {

	// sum price * quantity of transaction items
	const sumValue: string = createSumValue(transactionItems);

	// create transaction
	const transaction: ITransaction = {
		...emptyTransaction,
		sum_value: sumValue,
		transaction_items: transactionItems,
	};

	// wrap transaction in IntraTransaction declared in
	// services/gopkg/types/transaction.go
	const intraTransaction: IIntraTransaction = {
		auth_account: authAccount,
		transaction,
	}

	return intraTransaction;
};