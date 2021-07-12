import { jest } from "@jest/globals"

const mockConnect = jest.fn(() => Promise.resolve({}));
const mockEnd = jest.fn(() => Promise.resolve({}));
const mockPool = jest.fn(() => ({
	connect: mockConnect,
	end: mockEnd,
}));
jest.mock('pg', () => ({ Pool: mockPool }));

describe('db', () => {
	test('pool called with args', async () => {
		const want = {
			user: 'test',
			password: 'test',
			host: 'localhost',
			database: 'mxfactorial',
			port: 5432,
			max: 20,
			idleTimeoutMillis: 10000,
			connectionTimeoutMillis: 500,
		};
		await import('./index');
		expect(mockPool).toHaveBeenCalledWith(want);
	});

	test('connect method called', async () => {
		const db = await import('./index');
		await db.default.connect();
		expect(mockConnect).toHaveBeenCalled();
	});

	test('end method called', async () => {
		const db = await import('./index');
		await db.default.end();
		expect(mockEnd).toHaveBeenCalled();
	});
});