import { describe, it, expect } from 'vitest';
import { sortTrItems } from './sort';

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

describe('sortTrItems', () => {
	it('places user-added item before rule-added item with same exec id', () => {
		const execId = 'exec-1';
		const userItem = makeItem({
			item_id: 'user',
			rule_exec_ids: [execId],
			rule_instance_id: ''
		});
		const ruleItem = makeItem({
			item_id: 'rule',
			rule_exec_ids: [execId],
			rule_instance_id: 'rule-1'
		});
		const items = [ruleItem, userItem];
		sortTrItems(items);
		expect(items[0].item_id).toBe('user');
		expect(items[1].item_id).toBe('rule');
	});

	it('does nothing for items without rule_exec_ids', () => {
		const items = [makeItem({ item_id: 'a' }), makeItem({ item_id: 'b' })];
		sortTrItems(items);
		expect(items[0].item_id).toBe('a');
		expect(items[1].item_id).toBe('b');
	});
});
