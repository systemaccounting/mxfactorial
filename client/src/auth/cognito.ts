import { CognitoUserPool, AuthenticationDetails, CognitoUser} from 'amazon-cognito-identity-js';
import type { ICognitoUserPoolData } from 'amazon-cognito-identity-js';
import b64 from 'base-64';

const poolData: ICognitoUserPoolData = {
	UserPoolId: process.env.POOL_ID ? b64.decode(process.env.POOL_ID).trim() : "",
	ClientId: process.env.CLIENT_ID ? b64.decode(process.env.CLIENT_ID).trim(): "",
};

let userPool: CognitoUserPool;
let cognitoUser: CognitoUser;

if (process.env.POOL_ID && process.env.CLIENT_ID) {
	userPool = new CognitoUserPool(poolData);
	cognitoUser = userPool.getCurrentUser();
}

function signIn(account: string, password: string) {
	const authDetails = new AuthenticationDetails({
		Username: account,
		Password: password,
	});

	const userData = {
		Username: account,
		Pool: userPool,
	};

	cognitoUser = new CognitoUser(userData);

	return new Promise((res, rej) => {
		cognitoUser.authenticateUser(authDetails, {
			onSuccess: function () { // passes "data"
				res({});
			},
			onFailure: function (err) {
				console.error(err.message)
				rej(err)
			}
		});
	});
};

function signOut() {
	try {
		cognitoUser.signOut();
	} catch (e) {
		console.log(e);
	};
};

function signUp(account: string, password: string) {
	return new Promise((res, rej) => {
		userPool.signUp(account, password, [], null, function (err, result): Promise<string> {
			if (err) {
				rej(err)
				return;
			}
			cognitoUser = result.user;
			res(cognitoUser.getUsername());
		})
	});
};

function getIdToken(cb) {
	if (cognitoUser != null) {
		cognitoUser.getSession(function(err, session) {
			if (err) {
				alert(err.message || JSON.stringify(err));
				return;
			}
			cb(session.getIdToken().jwtToken);
		})
	}
}

export {
	userPool,
	signIn,
	signOut,
	signUp,
	getIdToken,
}