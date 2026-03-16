import { describe, it, expect } from 'vitest';
import { Cookies } from './cookie';

const CLIENT_ID = 'test-client-id';
const PREFIX = `CognitoIdentityServiceProvider.${CLIENT_ID}`;
const USER = 'TestUser';

function makeCookies(extras: Array<{ name: string; value: string }> = []) {
	return [{ name: `${PREFIX}.LastAuthUser`, value: USER }, ...extras];
}

describe('Cookies', () => {
	it('throws when clientId is missing', () => {
		expect(() => new Cookies(undefined, [])).toThrow('clientId missing');
	});

	it('returns lastAuthUser', () => {
		const c = new Cookies(CLIENT_ID, makeCookies());
		expect(c.lastAuthUser()).toBe(USER);
	});

	it('returns idToken', () => {
		const cookies = makeCookies([{ name: `${PREFIX}.${USER}.idToken`, value: 'id-tok' }]);
		const c = new Cookies(CLIENT_ID, cookies);
		expect(c.idToken()).toBe('id-tok');
	});

	it('returns accessToken', () => {
		const cookies = makeCookies([{ name: `${PREFIX}.${USER}.accessToken`, value: 'access-tok' }]);
		const c = new Cookies(CLIENT_ID, cookies);
		expect(c.accessToken()).toBe('access-tok');
	});

	it('returns refreshToken', () => {
		const cookies = makeCookies([{ name: `${PREFIX}.${USER}.refreshToken`, value: 'refresh-tok' }]);
		const c = new Cookies(CLIENT_ID, cookies);
		expect(c.refreshToken()).toBe('refresh-tok');
	});

	it('returns clockDrift as number', () => {
		const cookies = makeCookies([{ name: `${PREFIX}.${USER}.clockDrift`, value: '42' }]);
		const c = new Cookies(CLIENT_ID, cookies);
		expect(c.clockDrift()).toBe(42);
	});

	it('throws when cookie not found', () => {
		const c = new Cookies(CLIENT_ID, makeCookies());
		expect(() => c.idToken()).toThrow('cookie not found');
	});
});
