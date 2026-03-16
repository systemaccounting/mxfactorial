import { describe, it, expect } from 'vitest';
import { duplicatePerRole, filterUserAddedItems, filterRuleAddedItems } from './filters';

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

describe('duplicatePerRole', () => {
	it('duplicates transaction when account is both creditor and debitor', () => {
		const items = [makeItem({ creditor: 'Alice', debitor: 'Alice' })];
		const trans = makeTrans({ transaction_items: items });
		const result = duplicatePerRole('Alice', [trans]);
		expect(result).toHaveLength(2);
	});

	it('returns one copy when account is only creditor', () => {
		const result = duplicatePerRole('Bob', [makeTrans()]);
		expect(result).toHaveLength(1);
	});

	it('returns one copy when account is only debitor', () => {
		const result = duplicatePerRole('Alice', [makeTrans()]);
		expect(result).toHaveLength(1);
	});

	it('returns empty for unrelated account', () => {
		const result = duplicatePerRole('Charlie', [makeTrans()]);
		expect(result).toHaveLength(0);
	});
});

describe('filterUserAddedItems', () => {
	it('returns items without rule_instance_id', () => {
		const items = [makeItem(), makeItem({ rule_instance_id: 'rule-1' })];
		expect(filterUserAddedItems(items)).toHaveLength(1);
		expect(filterUserAddedItems(items)[0].rule_instance_id).toBe('');
	});
});

describe('filterRuleAddedItems', () => {
	it('returns items with rule_instance_id', () => {
		const items = [makeItem(), makeItem({ rule_instance_id: 'rule-1' })];
		expect(filterRuleAddedItems(items)).toHaveLength(1);
		expect(filterRuleAddedItems(items)[0].rule_instance_id).toBe('rule-1');
	});
});
