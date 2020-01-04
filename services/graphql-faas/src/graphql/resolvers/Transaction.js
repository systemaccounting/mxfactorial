// go app
// handlerFn() in resolvers/index.js
const GetTransactionsResolver = (
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
    FunctionName: process.env.TRANSACTION_QUERY_LAMBDA_ARN,
    Payload: JSON.stringify({
      transaction_id: args.transactionID,
      account: args.account,
      graphqlRequestSender
    })
  }
  return handlerFn(service.invoke(params).promise())
}

module.exports = GetTransactionsResolver
