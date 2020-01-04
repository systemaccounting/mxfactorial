// node.js app
const CreateRequestResolver = (
  service,
  handlerFn,
  args,
  graphqlRequestSender
  ) => {
  if (!args.items) {
    console.log('empty object received by resolver')
    return 'please specify at least 1 transaction'
  }
  const params = {
    FunctionName: process.env.REQUEST_CREATE_LAMBDA_ARN,
    Payload: JSON.stringify({
      items: args.items,
      graphqlRequestSender
    })
  }
  return handlerFn(service.invoke(params).promise())
}

// go app
// handlerFn() in resolvers/index.js
const GetRequestResolver = (
  service,
  handlerFn,
  args,
  graphqlRequestSender
  ) => {
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
  return handlerFn(service.invoke(params).promise())
}

// node.js app
const ApproveRequestResolver = (
  service,
  handlerFn,
  args,
  graphqlRequestSender
  ) => {
  if (!args.items) {
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
  return handlerFn(service.invoke(params).promise())
}

module.exports = {
  CreateRequestResolver,
  GetRequestResolver,
  ApproveRequestResolver
}
