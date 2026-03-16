import { describe, it, expect } from 'vitest';
import {
	isCreditor,
	isRejected,
	isRequestPending,
	getTransContraAccount,
	getTrItemsContraAccount
} from './accounts';

function makeItem(overrides: Partial<App.ITransactionItem> = {}): App.ITransactionItem {
	return {
		id: '1',
		transaction_id: '1',
		item_id: 'bread',
		price: '3.000',
		quantity: '1.000',
		rule_instance_id: '',
		rule_exec_ids: [],
		unit_of_measurement: '',
		units_measured: '',
		debitor: 'Alice',
		creditor: 'Bob',
		debitor_profile_id: '',
		creditor_profile_id: '',
		debitor_approval_time: '',
		creditor_approval_time: '',
		debitor_rejection_time: '',
		creditor_rejection_time: '',
		debitor_expiration_time: '',
		creditor_expiration_time: '',
		...overrides
	} as App.ITransactionItem;
}

function makeTrans(overrides: Partial<App.ITransaction> = {}): App.ITransaction {
	return {
		id: '1',
		rule_instance_id: '',
		author: 'Alice',
		author_device_id: '',
		author_device_latlng: '',
		author_role: 'debitor',
		equilibrium_time: '',
		sum_value: '3.000',
		transaction_items: [makeItem()],
		...overrides
	};
}

describe('isCreditor', () => {
	it('returns true when account is creditor', () => {
		expect(isCreditor('Bob', [makeItem()])).toBe(true);
	});

	it('returns false when account is not creditor', () => {
		expect(isCreditor('Charlie', [makeItem()])).toBe(false);
	});
});

describe('isRejected', () => {
	it('returns false when rejection times are null', () => {
		const item = makeItem({
			debitor_rejection_time: null as unknown as string,
			creditor_rejection_time: null as unknown as string
		});
		expect(isRejected([item])).toBe(false);
	});

	it('returns true when debitor rejected', () => {
		expect(isRejected([makeItem({ debitor_rejection_time: '2024-01-01' })])).toBe(true);
	});

	it('returns true when creditor rejected', () => {
		expect(isRejected([makeItem({ creditor_rejection_time: '2024-01-01' })])).toBe(true);
	});
});

describe('isRequestPending', () => {
	it('returns true when creditor has approved', () => {
		const item = makeItem({ creditor_approval_time: '2024-01-01' });
		const trans = makeTrans({ transaction_items: [item] });
		expect(isRequestPending('Bob', trans)).toBe(true);
	});

	it('returns true when debitor has approved', () => {
		const item = makeItem({ debitor_approval_time: '2024-01-01' });
		const trans = makeTrans({ transaction_items: [item] });
		expect(isRequestPending('Alice', trans)).toBe(true);
	});

	it('returns false when no approvals', () => {
		expect(isRequestPending('Alice', makeTrans())).toBe(false);
	});
});

describe('getTransContraAccount', () => {
	it('returns debitor when current account is creditor', () => {
		expect(getTransContraAccount('Bob', makeTrans())).toBe('Alice');
	});

	it('returns creditor when current account is debitor', () => {
		expect(getTransContraAccount('Alice', makeTrans())).toBe('Bob');
	});

	it('skips rule items and falls back to author', () => {
		const ruleItem = makeItem({ rule_instance_id: 'rule-1' });
		const trans = makeTrans({ transaction_items: [ruleItem] });
		expect(getTransContraAccount('Charlie', trans)).toBe('Alice');
	});
});

describe('getTrItemsContraAccount', () => {
	it('returns debitor when current account is creditor', () => {
		expect(getTrItemsContraAccount('Bob', [makeItem()])).toBe('Alice');
	});

	it('returns creditor when current account is debitor', () => {
		expect(getTrItemsContraAccount('Alice', [makeItem()])).toBe('Bob');
	});

	it('skips rule items', () => {
		const ruleItem = makeItem({ rule_instance_id: 'rule-1', debitor: 'Tax', creditor: 'Gov' });
		const userItem = makeItem();
		expect(getTrItemsContraAccount('Bob', [ruleItem, userItem])).toBe('Alice');
	});
});
