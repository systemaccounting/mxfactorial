const AWS = require('aws-sdk')
const cognitoIdsp = new AWS.CognitoIdentityServiceProvider({
  region: process.env.REACT_APP_AWS_REGION,
  apiVersion: '2016-04-18'
})

const deleteUser = (poolId, account) => {
  let params = {
    UserPoolId: poolId,
    Username: account
  }
  return cognitoIdsp
    .adminDeleteUser(params)
    .promise()
    .then(data => data)
    .catch(err => console.log(err))
}

module.exports = {
  deleteUser
}
