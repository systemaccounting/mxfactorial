import {
	CognitoUserPool,
	AuthenticationDetails,
	CognitoUser,
	ICognitoUserPoolData,
} from 'amazon-cognito-identity-js';

const poolData: ICognitoUserPoolData = {
	// avoid atob when developing locally
	UserPoolId: process.env.POOL_ID ? atob(process.env.POOL_ID).trim() : "",
	ClientId: process.env.CLIENT_ID ? atob(process.env.CLIENT_ID).trim(): "",
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
			onSuccess: function (data) {
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


export {
	userPool,
	signIn,
	signOut,
	signUp,
}