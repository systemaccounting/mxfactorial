const aws = require('aws-sdk')
const lambda = new aws.Lambda()

const AddTransactionResolver = args => {
  if (!args) {
    console.log(`Empty object received by resolver`)
    return `Please specify at least 1 transaction`
  }
  const params = {
    FunctionName: process.env.TRANSACT_LAMBDA_ARN,
    Payload: JSON.stringify({ items: args.items })
  }
  return lambda
    .invoke(params)
    .promise()
    .then(data => JSON.parse(data.Payload))
    .then(res => {
      if (res.status === 'failed') {
        console.log(res.message)
        throw new Error(res.message)
      }
      return res.data
    })
}

const GetTransactionResolver = args => {
  if (!args.user) {
    console.log(`Please specify user`)
    return `Please specify user`
  }

  let params = {
    FunctionName: process.env.MEASURE_LAMBDA_ARN,
    Payload: JSON.stringify(args)
  }
  return lambda
    .invoke(params)
    .promise()
    .then(data => {
      let parseStringToJson = JSON.parse(data.Payload)
      let parseJsonToJsObject = JSON.parse(parseStringToJson)
      return parseJsonToJsObject
    })
    .catch(err => {
      console.error(err, err.stack)
    })
}

module.exports = {
  GetTransactionResolver,
  AddTransactionResolver
}
