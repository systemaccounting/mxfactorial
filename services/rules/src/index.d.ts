import type { QueryResult } from 'pg';

export interface IApproval {
	id: string;
	rule_instance_id: string;
	transaction_id: string;
	transaction_item_id: string;
	account_name: string;
	account_role: string;
	device_id: string;
	device_latlng: string;
	approval_time: string;
	rejection_time: string;
	expiration_time: string;
}

export interface ITransactionItem {
	id: string;
	transaction_id: string;
	item_id: string;
	price: string;
	quantity: string;
	debitor_first: boolean;
	rule_instance_id: string;
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
	approvals?: IApproval[];
}

export interface ITransaction {
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

export interface IIntraTransaction {
	auth_account: string;
	transaction: ITransaction;
}

export interface IAccountProfile {
	id: string;
	account_name: string;
	description: string;
	first_name: string;
	middle_name: string;
	last_name: string;
	country_name: string;
	street_number: string;
	street_name: string;
	floor_number: string;
	unit_number: string;
	city_name: string;
	county_name: string;
	region_name: string;
	state_name: string;
	postal_code: string;
	latlng: string;
	email_address: string;
	telephone_country_code: string;
	telephone_area_code: string;
	telephone_number: string;
	occupation_id: string;
	industry_id: string;
	removal_time: string;
	created_at: string;
}

export interface IRuleInstance {
	id: string;
	rule_type: string;
	rule_name: string;
	rule_instance_name: string;
	variable_values: string[];
	account_role: string;
	item_id: string;
	price: string;
	quantity: string;
	unit_of_measurement: string;
	units_measured: string;
	account_name: string;
	first_name: string;
	middle_name: string;
	last_name: string;
	country_name: string;
	street_id: string;
	street_name: string;
	floor_number: string;
	unit_id: string;
	city_name: string;
	county_name: string;
	region_name: string;
	state_name: string;
	postal_code: string;
	latlng: string;
	email_address: string;
	telephone_country_code: string;
	telephone_area_code: string;
	telephone_number: string;
	occupation_id: string;
	industry_id: string;
	disabled_time: string;
	removed_time: string;
	created_at: string;
}

export type query = (text: string, params: string[]) => Promise<QueryResult>;

export interface IPGPool {
	connect: () => Promise<IPGClient>,
	end: () => void,
}

export interface IPGClient {
	query: query,
	release: () => void,
}

declare global {
	namespace NodeJS {
		interface Global {
			applyApproverRuleMockFn: jest.Mock;
			applyItemRuleMockFn: jest.Mock;
		}
	}
}