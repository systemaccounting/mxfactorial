// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}

		interface ITransactionItem {
			id: string;
			transaction_id: string;
			item_id: string;
			price: string;
			quantity: string;
			debitor_first: boolean;
			rule_instance_id: string;
			rule_exec_ids: string[];
			unit_of_measurement: string;
			units_measured: string;
			debitor: string;
			creditor: string;
			debitor_profile_id: string;
			creditor_profile_id: string;
			debitor_approval_time: string;
			creditor_approval_time: string;
			debitor_rejection_time: string;
			creditor_rejection_time: string;
			debitor_expiration_time: string;
			creditor_expiration_time: string;
		}

		interface ITransaction {
			id: string;
			rule_instance_id: string;
			author: string;
			author_device_id: string;
			author_device_latlng: string;
			author_role: string;
			equilibrium_time: string;
			sum_value: string;
			transaction_items: ITransactionItem[];
		}

		interface ITransactionNotification {
			id: string;
			transaction_id: string;
			account_name: string;
			account_role: string;
			message: string;
			created_at: string;
		}

		interface IInsertValueId {
			id: string;
			value: string;
		}
	}
}

export {};
