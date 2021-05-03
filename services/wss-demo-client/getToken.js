module.exports = (service, clientId, account, secret, enableLogging) => {
  let params = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: clientId,
    AuthParameters: {
      'USERNAME': account,
      'PASSWORD': secret
    }
  };
  return service.initiateAuth(params)
    .promise()
    .then(data => {
      if (enableLogging == 'true') {
        console.log(data.AuthenticationResult.IdToken);
      }
      return data.AuthenticationResult.IdToken;
    })
    .catch(err => console.log(err));
}