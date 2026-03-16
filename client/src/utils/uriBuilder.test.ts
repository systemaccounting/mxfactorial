import { describe, it, expect } from 'vitest';
import uriBuilder from './uriBuilder';

describe('uriBuilder', () => {
	it('adds http:// when protocol missing', () => {
		expect(uriBuilder('example.com', undefined, false)).toBe('http://example.com/');
	});

	it('adds ws:// for websocket uris without protocol', () => {
		expect(uriBuilder('example.com/ws', undefined, false)).toBe('ws://example.com/ws');
	});

	it('preserves existing protocol', () => {
		expect(uriBuilder('https://example.com', undefined, false)).toBe('https://example.com/');
	});

	it('upgrades http to https when tls enabled', () => {
		expect(uriBuilder('example.com', undefined, true)).toBe('https://example.com/');
	});

	it('upgrades ws to wss when tls enabled', () => {
		expect(uriBuilder('example.com/ws', undefined, true)).toBe('wss://example.com/ws');
	});

	it('appends resource path', () => {
		expect(uriBuilder('example.com', 'api/v1', false)).toBe('http://example.com/api/v1');
	});

	it('strips leading slashes from resource', () => {
		expect(uriBuilder('example.com', '///api', false)).toBe('http://example.com/api');
	});

	it('strips trailing slashes from resource', () => {
		expect(uriBuilder('example.com', 'api///', false)).toBe('http://example.com/api');
	});
});
