type ICookies = Array<{
    name: string;
    value: string;
}>

// cadet todo: add unit tests
class Cookies {
	private cookiePrefix = 'CognitoIdentityServiceProvider';
	private keyPrefix: string;
	private cookies: Map<string, string>;

	constructor(clientId: string | undefined, cookieList: ICookies) {
		if (!clientId) {
			throw new Error('Cookies: clientId missing');
		}
		this.cookies = new Map<string, string>();
		for (const cookie of cookieList) {
			this.cookies.set(cookie.name, cookie.value);
		}
		this.keyPrefix = `${this.cookiePrefix}.${clientId}`;
	}

	#get(key: string): string {
		const c = this.cookies.get(key);
		if (c) {
			return c;
		} else {
			throw new Error(`cookie not found: ${key}`);
		}
	}

	// cookies set by getSession method in:
	// client/node_modules/amazon-cognito-identity-js/src/CognitoUser.js
	lastAuthUser(): string {
		return this.#get(`${this.keyPrefix}.LastAuthUser`);
	}

	idToken(): string {
		return this.#get(`${this.keyPrefix}.${this.lastAuthUser()}.idToken`);
	}

	accessToken(): string {
		return this.#get(`${this.keyPrefix}.${this.lastAuthUser()}.accessToken`);
	}

	refreshToken(): string {
		return this.#get(`${this.keyPrefix}.${this.lastAuthUser()}.refreshToken`);
	}

	clockDrift(): number {
		return parseInt(this.#get(`${this.keyPrefix}.${this.lastAuthUser()}.clockDrift`));
	}
}

export { Cookies };