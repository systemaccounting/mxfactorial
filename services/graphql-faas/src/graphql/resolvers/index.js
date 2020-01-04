const AWS = require('aws-sdk')

const {
  CreateRequestResolver,
  GetRequestResolver,
  ApproveRequestResolver
} = require('./Request')

const GetTransactionsResolver = require('./Transaction')

const {
  getRules,
  queryTable,
  GetRuleTransactionsResolver,
  GetRuleInstanceResolver
} = require('./Rule')

const {
  goLambdaPromiseHandler,
  nodeLambdaPromiseHandler
} = require('./PromiseHandlers')

const lambda = new AWS.Lambda()
const ddb = new AWS.DynamoDB.DocumentClient({
  region: process.env.AWS_REGION
})

module.exports = {
  Query: {
    transactionsByID: (parentValue, args, ctx) => {
      return GetTransactionsResolver(
        lambda,
        goLambdaPromiseHandler,
        args,
        ctx.graphqlRequestSender
      )
    },
    transactionsByAccount: (parentValue, args, ctx) => {
      return GetTransactionsResolver(
        lambda,
        goLambdaPromiseHandler,
        args,
        ctx.graphqlRequestSender
      )
    },
    requestsByID: (parentValue, args, ctx) => {
      return GetRequestResolver(
        lambda,
        goLambdaPromiseHandler,
        args,
        ctx.graphqlRequestSender
      )
    },
    requestsByAccount: (parentValue, args, ctx) => {
      return GetRequestResolver(
        lambda,
        goLambdaPromiseHandler,
        args,
        ctx.graphqlRequestSender
      )
    },
    rules: (parentValue, args) => {
      return GetRuleTransactionsResolver(
        lambda,
        args
      )
    },
    ruleInstances: (parentValue, args) => {
      return GetRuleInstanceResolver(
        ddb,
        args.keySchema,
        getRules,
        queryTable
      )
    },
  },
  Mutation: {
    createRequest: (parentValue, args, ctx) => {
      return CreateRequestResolver(
        lambda,
        nodeLambdaPromiseHandler,
        args,
        ctx.graphqlRequestSender
      )
    },
    approveRequest: (parentValue, args, ctx) => {
      return ApproveRequestResolver(
        lambda,
        nodeLambdaPromiseHandler,
        args,
        ctx.graphqlRequestSender
      )
    }
  }
}