import {
	CognitoUserPool,
	AuthenticationDetails,
	CognitoUser,
	CookieStorage
} from 'amazon-cognito-identity-js';
import type { ICognitoUserPoolData, ICognitoUserData, ICookieStorageData } from 'amazon-cognito-identity-js';
import JsCookies from 'js-cookie';

// cookie key prefix defined in getSession method:
// client/node_modules/amazon-cognito-identity-js/src/CognitoUser.js
// local dev only:
const LastAuthUserKey = (clientId: string): string => `CognitoIdentityServiceProvider.${clientId}.LastAuthUser`;
const IdToken = (clientId: string, account: string): string => {
	return `CognitoIdentityServiceProvider.${clientId}.${account}.idToken`
};

function cookieConf(domain: string): ICookieStorageData {
	return {
		domain,
		secure: (domain === 'localhost') ? false : true,
		expires: 1,
		path: '/',
		sameSite: 'lax',
	};
}

function configureUserPool(poolId: string, clientId: string, domain: string): CognitoUserPool {
	const cookieOpts = cookieConf(domain);
	const poolData: ICognitoUserPoolData = {
		UserPoolId: poolId,
		ClientId: clientId,
		Storage: new CookieStorage(cookieOpts),
	};
	return new CognitoUserPool(poolData);
}

function createAuthDetails(username: string, password: string): AuthenticationDetails {
	return new AuthenticationDetails({
		Username: username,
		Password: password,
	});
}

function createCognitoUser(userData: ICognitoUserData): CognitoUser {
	return new CognitoUser(userData);
}

function signIn(
	poolId: string,
	clientId: string,
	domain: string,
	account: string,
	password: string): Promise<CognitoUser | void> {
	// local env
	if (clientId == 'localhost') {
		JsCookies.set(LastAuthUserKey(clientId), account, cookieConf(domain));
		JsCookies.set(IdToken(clientId, account), 'localhost', cookieConf(domain));
		return Promise.resolve()
	}
	// cloud env
	return new Promise((resolve, reject) => {
		const cookieOpts = cookieConf(domain);
		const cognitoUser = createCognitoUser({
			Username: account,
			Pool: configureUserPool(poolId, clientId, domain),
			Storage: new CookieStorage(cookieOpts),
		});
		const authDetails = createAuthDetails(account, password);
		cognitoUser.authenticateUser(authDetails, {
			onSuccess: () => resolve(cognitoUser),
			onFailure: (err) => reject(err)
		});
	});
}

function signUp(
	poolId: string,
	clientId: string,
	domain: string,
	account: string,
	password: string): Promise<CognitoUser | void> {
	// local env
	if (clientId == 'localhost') {
		JsCookies.set(LastAuthUserKey(clientId), account, cookieConf(domain));
		JsCookies.set(IdToken(clientId, account), 'localhost', cookieConf(domain));
		return Promise.resolve()
	}
	// cloud env
	const userPool = configureUserPool(poolId, clientId, domain);
	return new Promise((resolve, reject) => {
		userPool.signUp(account, password, [], [], (err, result) => {
			if (err) {
				reject(err);
			} else {
				if (result) {
					resolve(result.user);
				} else {
					reject('empty response');
				}
			}
		});
	});
};

function signOut(
	poolId: string,
	clientId: string,
	domain: string,
): Promise<void> {
	// get session from cookie storage
	const lastAuthUser = JsCookies.get(LastAuthUserKey(clientId));
	if (!lastAuthUser) {
		console.error('last auth user not found');
		return Promise.resolve();
	}
	// local env
	if (clientId === 'localhost') {
		JsCookies.remove(LastAuthUserKey(clientId), cookieConf(domain));
		JsCookies.remove(IdToken(clientId, lastAuthUser), cookieConf(domain));
		return Promise.resolve()
	}
	// cloud env
	const cognitoUser = new CognitoUser({
		Username: lastAuthUser,
		Pool: configureUserPool(poolId, clientId, domain),
		Storage: new CookieStorage(cookieConf(domain)),
	})
	return new Promise((resolve) => {
		cognitoUser.signOut();
		resolve();
	});
}

export { signIn, signUp, signOut };