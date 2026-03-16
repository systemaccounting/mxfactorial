import { describe, it, expect } from 'vitest';
import { getTransactionById, sum, disableButton, accountsAvailable } from './index';

function makeItem(overrides: Partial<App.ITransactionItem> = {}): App.ITransactionItem {
	return {
		id: '1',
		transaction_id: '1',
		item_id: 'bread',
		price: '3.000',
		quantity: '2.000',
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
		sum_value: '6.000',
		transaction_items: [makeItem()],
		...overrides
	};
}

describe('getTransactionById', () => {
	it('returns matching transaction', () => {
		const t1 = makeTrans({ id: 'a' });
		const t2 = makeTrans({ id: 'b' });
		expect(getTransactionById('b', [t1, t2])).toBe(t2);
	});

	it('returns undefined for no match', () => {
		expect(getTransactionById('z', [makeTrans()])).toBeUndefined();
	});
});

describe('sum', () => {
	it('sums price * quantity', () => {
		expect(sum([makeItem({ price: '3.000', quantity: '2.000' })])).toBe('6.000');
	});

	it('sums multiple items', () => {
		const items = [
			makeItem({ price: '1.000', quantity: '1.000' }),
			makeItem({ price: '2.000', quantity: '3.000' })
		];
		expect(sum(items)).toBe('7.000');
	});

	it('skips items with NaN price or quantity', () => {
		const items = [
			makeItem({ price: 'bad', quantity: '1.000' }),
			makeItem({ price: '2.000', quantity: '3.000' })
		];
		expect(sum(items)).toBe('6.000');
	});

	it('skips items with zero price or quantity', () => {
		const items = [makeItem({ price: '0', quantity: '5.000' })];
		expect(sum(items)).toBe('0.000');
	});

	it('returns 0.000 for empty array', () => {
		expect(sum([])).toBe('0.000');
	});
});

describe('disableButton', () => {
	it('returns false when all items have valid fields', () => {
		expect(disableButton([makeItem()])).toBe(false);
	});

	it('returns true when item_id is empty', () => {
		expect(disableButton([makeItem({ item_id: '' })])).toBe(true);
	});

	it('returns true when price is NaN', () => {
		expect(disableButton([makeItem({ price: 'abc' })])).toBe(true);
	});

	it('returns false when quantity is zero but fields are filled', () => {
		expect(disableButton([makeItem({ quantity: '0' })])).toBe(false);
	});

	it('skips rule items', () => {
		const ruleItem = makeItem({
			rule_instance_id: 'rule-1',
			item_id: '',
			price: '',
			quantity: ''
		});
		expect(disableButton([makeItem(), ruleItem])).toBe(false);
	});
});

describe('accountsAvailable', () => {
	it('returns true when all items have debitor and creditor', () => {
		expect(accountsAvailable([makeItem()])).toBe(true);
	});

	it('returns false when debitor missing', () => {
		expect(accountsAvailable([makeItem({ debitor: '' })])).toBe(false);
	});

	it('returns false when creditor missing', () => {
		expect(accountsAvailable([makeItem({ creditor: '' })])).toBe(false);
	});
});
