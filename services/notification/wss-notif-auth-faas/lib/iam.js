// extends https://github.com/neverendingqs/serverless-websocket-example/blob/master/src/authorizer.js
const authorize = (resource, tokenParsedAccount) => {
  return {
    principalId: 'LambdaAuthorizer',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: 'Allow',
        Resource: resource
      }]
    },
    context: {
      account: tokenParsedAccount
    }
  }
}

module.exports = authorize