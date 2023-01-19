import type { ITransaction, ITransactionItem, IApproval } from "../../services/rules/src/index.d"

export interface IIntraEvent {
	auth_account: string
}

export interface IIntraTransaction extends IIntraEvent {
	transaction: ITransaction;
}

export interface IRequestApprove extends IIntraEvent {
	id: string;
	account_name: string;
	account_role: string;
}

export interface IQueryByAccount extends IIntraEvent {
	account_name: string;
}

export interface IQueryByID extends IIntraEvent {
	id: string;
}