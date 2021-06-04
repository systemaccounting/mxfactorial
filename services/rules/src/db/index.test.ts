import { jest } from "@jest/globals"

const mockQuery = jest.fn(() => Promise.resolve({}));
const mockEnd = jest.fn(() => Promise.resolve({}));
const mockClient = jest.fn(() => ({
	query: mockQuery,
	end: mockEnd,
}));
jest.mock('pg', () => ({ Client: mockClient }));

describe('db', () => {
	test('pool called with args', async () => {
		const want = {
			user: 'test',
			password: 'test',
			host: 'localhost',
			database: 'mxfactorial',
			port: 5432,
			connectionTimeoutMillis: 100,
		};
		await import('./index');
		expect(mockClient).toHaveBeenCalledWith(want);
	});

	test('query method called with args', async () => {
		const db = await import('./index');
		await db.default.query("test", ["1", "2"]);
		const got = mockQuery.mock.calls[0];
		expect(got).toEqual(["test", ["1", "2"]]);
	});
});