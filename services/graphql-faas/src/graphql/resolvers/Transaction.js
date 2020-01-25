// go app
// handlerFn() in resolvers/index.js
const GetTransactionsByIDResolver = (
  service,
  handlerFn,
  args,
  graphqlRequestSender
  ) => {
  if (!args.account) {
    console.log(
      'account not passed in query, using:',
      graphqlRequestSender
    )
    args.account = graphqlRequestSender // temporary
  }
  const params = {
    FunctionName: process
      .env.TRANSACTION_QUERY_BY_TRANSACTION_ID_LAMBDA_ARN,
    Payload: JSON.stringify({
      transaction_id: args.transactionID,
      account: args.account,
      graphqlRequestSender
    })
  }
  return handlerFn(service.invoke(params).promise())
}

// go app
// handlerFn() in resolvers/index.js
const GetTransactionsByAccountResolver = (
  service,
  handlerFn,
  args,
  graphqlRequestSender
  ) => {
  if (!args.account) {
    console.log(
      'account not passed in query, using:',
      graphqlRequestSender
    )
    args.account = graphqlRequestSender // temporary
  }
  const params = {
    FunctionName: process
      .env.TRANSACTION_QUERY_BY_ACCOUNT_LAMBDA_ARN,
    Payload: JSON.stringify({
      account: args.account,
      graphqlRequestSender
    })
  }
  return handlerFn(service.invoke(params).promise())
}

module.exports = {
  GetTransactionsByIDResolver,
  GetTransactionsByAccountResolver
}
