// node.js app
const CreateRequestResolver = (service, args, graphqlRequestSender) => {
  if (!args) {
    console.log('Empty object received by resolver')
    return 'Please specify at least 1 transaction'
  }
  const params = {
    FunctionName: process.env.REQUEST_CREATE_LAMBDA_ARN,
    Payload: JSON.stringify({
      items: args.items,
      graphqlRequestSender
    })
  }
  return service
    .invoke(params)
    .promise()
    .then(data => {
      let response = JSON.parse(data.Payload)
      return response.data
    })
    .catch(err => {
      console.log(err.message)
      throw new Error(err.message)
    })
}

// go app
const GetRequestResolver = (service, args, graphqlRequestSender) => {
  if (!args.account) {
    console.log('account not passed in query, using:', graphqlRequestSender)
    args.account = graphqlRequestSender // temporary
  }
  let params = {
    FunctionName: process.env.REQUEST_QUERY_LAMBDA_ARN,
    Payload: JSON.stringify({
      transaction_id: args.transactionID,
      account: args.account,
      graphqlRequestSender
    })
  }
  return service
    .invoke(params)
    .promise()
    .then(data => {
      let parseStringToJson = JSON.parse(data.Payload)
      let parseJsonToJsObject = JSON.parse(parseStringToJson) // parse 2x for go
      return parseJsonToJsObject
    })
    .catch(err => {
      console.error(err, err.stack)
    })
}

// node.js app
const ApproveRequestResolver = (service, args, graphqlRequestSender) => {
  if (!args) {
    console.log('empty object received by resolver')
    return 'please specify at least 1 request'
  }
  const params = {
    FunctionName: process.env.REQUEST_APPROVE_LAMBDA_ARN,
    Payload: JSON.stringify({
      items: args.items,
      graphqlRequestSender
    })
  }
  return service
    .invoke(params)
    .promise()
    .then(data => {
      let response = JSON.parse(data.Payload)
      return response.data
    })
    .catch(err => {
      console.log(err)
      throw new Error(err)
    })
}

module.exports = {
  CreateRequestResolver,
  GetRequestResolver,
  ApproveRequestResolver
}
