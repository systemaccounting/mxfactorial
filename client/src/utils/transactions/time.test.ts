import { describe, it, expect } from 'vitest';
import { requestTime, expirationTime } from './time';

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

describe('requestTime', () => {
	it('returns earliest creditor approval time', () => {
		const items = [
			makeItem({ creditor_approval_time: '2024-06-01T12:00:00Z' }),
			makeItem({ creditor_approval_time: '2024-01-01T12:00:00Z' })
		];
		const result = requestTime(items);
		expect(result.toISOString()).toBe('2024-01-01T12:00:00.000Z');
	});

	it('returns earliest debitor approval time', () => {
		const items = [makeItem({ debitor_approval_time: '2024-03-15T00:00:00Z' })];
		const result = requestTime(items);
		expect(result.toISOString()).toBe('2024-03-15T00:00:00.000Z');
	});

	it('returns earliest across both roles', () => {
		const items = [
			makeItem({
				creditor_approval_time: '2024-06-01T00:00:00Z',
				debitor_approval_time: '2024-01-01T00:00:00Z'
			})
		];
		const result = requestTime(items);
		expect(result.toISOString()).toBe('2024-01-01T00:00:00.000Z');
	});
});

describe('expirationTime', () => {
	it('returns earliest expiration time', () => {
		const items = [
			makeItem({
				creditor_expiration_time: '2024-12-01T00:00:00Z',
				debitor_expiration_time: '2024-06-01T00:00:00Z'
			})
		];
		const result = expirationTime(items);
		expect(result.toISOString()).toBe('2024-06-01T00:00:00.000Z');
	});

	it('returns epoch zero when all expiration times are null', () => {
		const item = makeItem({
			creditor_expiration_time: null as unknown as string,
			debitor_expiration_time: null as unknown as string
		});
		const result = expirationTime([item]);
		expect(result.getTime()).toBe(0);
	});
});
