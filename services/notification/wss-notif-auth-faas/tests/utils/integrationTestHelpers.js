const createAccount = (service, clientId, account, secret) => {
  let params = {
    ClientId: clientId,
    Password: secret,
    Username: account,
    UserAttributes: [
      {
        Name: 'custom:account',
        Value: account
      }
    ]
  }
  return service.signUp(params)
    .promise()
    .then(data => {
      // console.log(data)
      return data
    })
    .catch(err => {
      console.log(err)
      throw err
    })
}

const deleteAccount = (service, poolId, account) => {
  let params = {
    UserPoolId: poolId,
    Username: account
  }
  return service.adminDeleteUser(params)
    .promise()
    .then(data => {
      // console.log(data)
      return data
    })
    .catch(err => {
      console.log(err)
      return err
    })
}

const getToken = async (service, clientId, account, secret) => {
  let params = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: clientId,
    AuthParameters: {
      'USERNAME': account,
      'PASSWORD': secret
    }
  }
  return service.initiateAuth(params)
    .promise()
    .then(data => data.AuthenticationResult.IdToken)
    .catch(err => err)
}

module.exports = {
  createAccount,
  deleteAccount,
  getToken
}