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

const GetTransactionResolver = arg => {
  let params = {}
  params.FunctionName = process.env.MEASURE_LAMBDA_ARN
  let payload = {}
  payload.id = arg
  params.Payload = JSON.stringify(payload)
  return lambda
    .invoke(params)
    .promise()
    .then(data => {
      console.log('from measure')
      // console.log(data)
      console.log(typeof data.Payload)
      let parseStringToJson = JSON.parse(data.Payload)
      let parseJsonToJsObject = JSON.parse(parseStringToJson)
      console.log(parseJsonToJsObject)
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
