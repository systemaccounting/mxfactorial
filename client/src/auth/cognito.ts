import { CognitoUserPool, AuthenticationDetails, CognitoUser} from 'amazon-cognito-identity-js';
import type { ICognitoUserPoolData, CognitoUserSession } from 'amazon-cognito-identity-js';
import b64 from 'base-64';
import c from '../utils/constants';

const poolData: ICognitoUserPoolData = {
	UserPoolId: process.env.POOL_ID ? b64.decode(process.env.POOL_ID).trim() : "",
	ClientId: process.env.CLIENT_ID ? b64.decode(process.env.CLIENT_ID).trim(): "",
};

let userPool: CognitoUserPool;
let cognitoUser: CognitoUser | null;

if (c.ENABLE_AUTH) {
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
        if (cognitoUser) {
            cognitoUser.authenticateUser(authDetails, {
                onSuccess: function () { // passes "data"
                    res({});
                },
                onFailure: function (err) {
                    console.error(err.message)
                    rej(err)
                }
            });
        }
    });
};

function signOut() {
	if (cognitoUser) {
		try {
			cognitoUser.signOut();
		} catch (e) {
			console.log(e);
		};
	}
};

function signUp(account: string, password: string) {
	return new Promise((res, rej) => {
		userPool.signUp(account, password, [], [], function (err, result): Promise<string>|void {
			if (err) {
				rej(err)
				return;
			}
			if (result) {
				cognitoUser = result.user;
				res(cognitoUser.getUsername());
			} else {
				rej("No result")
			}
		})
	});
};

function getIdToken(cb: (token: string) => void) {
	if (cognitoUser) {
		cognitoUser.getSession(function(err: Error | null, session: CognitoUserSession | null) {
			if (err) {
				alert(err.message || JSON.stringify(err));
				return;
			}
			if (session) {
				cb(session.getIdToken().getJwtToken());
			}
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