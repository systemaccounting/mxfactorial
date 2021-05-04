const AWS = require('aws-sdk')
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18' })

exports.handler = async (event) => {
  const params = {}
  params.UserPoolId = process.env.COGNITO_POOL_ID
  params.AttributesToGet = []
  params.Filter = `username ^= \"Faker\"`

  const listCognitoUsers = await new Promise((resolve, reject) => {
    cognitoidentityserviceprovider.listUsers(params, (err, data) => {
    if (err) {
      console.log(err, err.stack)
      reject(err)
      return
    }
    else {
      console.log(data)
      resolve(data)
      return
    }
  })
  }).catch(err => {
    console.log(err, err.stack)
    return err
  })

  let fakers = []
  for (let x = 0; x < listCognitoUsers.Users.length; x++) {
    fakers.push(listCognitoUsers.Users[x].Username)
  }

  const noFakersMsg = "No Faker accounts found"

  //Exit execution if Cognito purge unnecessary
  if (fakers.length < 1) {
    console.log(noFakersMsg)
    return
  }

  let responses = []

  for(let y = 0; y < fakers.length; y++) {
    const params = {}
    params.UserPoolId = process.env.COGNITO_POOL_ID
    params.Username = fakers[y]

    const deleteCognitoUser = await new Promise((resolve, reject) => {
        cognitoidentityserviceprovider.adminDeleteUser(params, (err, data) => {
        if (err) {
          console.log(err, err.stack)
          reject(err)
          return
        }
        else {
          console.log(data)
          resolve(data)
          return
        }
      })
    }).catch(err => {
      console.log(err, err.stack)
      return err
    })

    responses.push(deleteCognitoUser)
  }

  const errorFromCognito = (obj) => {
    return JSON.stringify(obj) === '{}'
  }

  if (!responses.every(errorFromCognito)) {
    console.log('Failing to delete all accounts')
    return
  } else {
    return
  }
}