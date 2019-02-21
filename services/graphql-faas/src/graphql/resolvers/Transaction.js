const aws = require('aws-sdk')
const lambda = new aws.Lambda()

const AddTransactionResolver = (arg) => {
  if (!arg) {
    console.log(`Empty object received by resolver`)
    return `Please specify at least 1 transaction`
  }
  let transaction = arg
  let params = {}
  params.FunctionName = process.env.TRANSACT_LAMBDA_ARN
  params.Payload = JSON.stringify(transaction)
  // console.log(params)
  return lambda.invoke(params)
  .promise()
  .then(data => {
      let responseFromTransact = JSON.parse(data.Payload)
      return responseFromTransact
    })
  .catch(err => { console.error(err, err.stack) })
}

const GetTransactionResolver = (arg) => {
  let params = {}
  params.FunctionName = process.env.MEASURE_LAMBDA_ARN
  let payload = {}
  payload.id = arg
  params.Payload = JSON.stringify(payload)
  return lambda.invoke(params)
  .promise()
  .then(data => {
      // console.log(data)
      let responseFromMeasure = JSON.parse(data.Payload)
      return responseFromMeasure
    })
  .catch(err => { console.error(err, err.stack) })
}

module.exports = {
  GetTransactionResolver,
  AddTransactionResolver
}