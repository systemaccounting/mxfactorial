// go app
const GetTransactionsResolver = (service, args, graphqlRequestSender) => {
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
  return service
    .invoke(params)
    .promise()
    .then(data => {
      let parseStringToJson = JSON.parse(data.Payload)
      let parseJsonToJsObject = JSON.parse(parseStringToJson) // 2x parse
      return parseJsonToJsObject
    })
    .catch(err => {
      console.error(err, err.stack)
    })
}

module.exports = GetTransactionsResolver
