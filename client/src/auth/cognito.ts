import {
	CognitoUserPool,
	AuthenticationDetails,
	CognitoUser,
} from 'amazon-cognito-identity-js';

const poolData = {
	UserPoolId: atob(process.env.POOL_ID).trim(),
	ClientId: atob(process.env.CLIENT_ID).trim(),
};

const userPool = new CognitoUserPool(poolData);

var cognitoUser: CognitoUser = userPool.getCurrentUser();

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