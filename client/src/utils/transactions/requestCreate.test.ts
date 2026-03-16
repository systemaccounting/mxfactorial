import { describe, it, expect } from 'vitest';
import {
	emptyItem,
	addItem,
	removeItem,
	addRuleItems,
	changeItem,
	addRecipient,
	switchRecipient,
	getRecipient
} from './requestCreate';

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

describe('emptyItem', () => {
	it('returns item with null fields', () => {
		const item = emptyItem();
		expect(item.id).toBeNull();
		expect(item.item_id).toBeNull();
		expect(item.price).toBeNull();
	});
});

describe('addItem', () => {
	it('appends a new item with same debitor/creditor', () => {
		const items = [makeItem()];
		const result = addItem(items);
		expect(result).toHaveLength(2);
		expect(result[1].debitor).toBe('Alice');
		expect(result[1].creditor).toBe('Bob');
	});
});

describe('removeItem', () => {
	it('returns empty item when only one item', () => {
		const result = removeItem([makeItem()], 0);
		expect(result).toHaveLength(1);
		expect(result[0].id).toBeNull();
	});

	it('returns empty item when only one user-added item remains', () => {
		const items = [makeItem(), makeItem({ rule_instance_id: 'rule-1' })];
		const result = removeItem(items, 0);
		expect(result).toHaveLength(1);
		expect(result[0].id).toBeNull();
	});

	it('removes item at index when multiple user-added items', () => {
		const items = [makeItem({ item_id: 'a' }), makeItem({ item_id: 'b' })];
		const result = removeItem(items, 0);
		expect(result).toHaveLength(1);
		expect(result[0].item_id).toBe('b');
	});
});

describe('addRuleItems', () => {
	it('combines user-added items with rule items', () => {
		const userItems = [makeItem()];
		const ruleItems = [makeItem({ rule_instance_id: 'rule-1' })];
		const result = addRuleItems(userItems, ruleItems);
		expect(result).toHaveLength(2);
		expect(result[1].rule_instance_id).toBe('rule-1');
	});

	it('strips old rule items from current items', () => {
		const items = [makeItem(), makeItem({ rule_instance_id: 'old-rule' })];
		const newRules = [makeItem({ rule_instance_id: 'new-rule' })];
		const result = addRuleItems(items, newRules);
		expect(result).toHaveLength(2);
		expect(result[1].rule_instance_id).toBe('new-rule');
	});
});

describe('changeItem', () => {
	it('updates item field at index', () => {
		const items = [makeItem()];
		const result = changeItem(items, 0, 'price', '5.000');
		expect(result[0].price).toBe('5.000');
	});
});

describe('addRecipient', () => {
	it('sets debitor and creditor on user-added items', () => {
		const items = [makeItem(), makeItem({ rule_instance_id: 'rule-1' })];
		const result = addRecipient(items, 'Charlie', 'Dave');
		expect(result).toHaveLength(1);
		expect(result[0].debitor).toBe('Charlie');
		expect(result[0].creditor).toBe('Dave');
	});
});

describe('switchRecipient', () => {
	it('swaps debitor and creditor', () => {
		const items = [makeItem({ debitor: 'Alice', creditor: 'Bob' })];
		const result = switchRecipient(items);
		expect(result[0].debitor).toBe('Bob');
		expect(result[0].creditor).toBe('Alice');
	});
});

describe('getRecipient', () => {
	it('returns empty string for empty items', () => {
		expect(getRecipient([emptyItem()], 'Alice')).toBe('');
	});

	it('returns contra account', () => {
		expect(getRecipient([makeItem()], 'Alice')).toBe('Bob');
	});
});
