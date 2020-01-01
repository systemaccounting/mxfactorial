const AWS = require('aws-sdk')

const {
  CreateRequestResolver,
  GetRequestResolver,
  ApproveRequestResolver
} = require('./Request')

const GetTransactionsResolver = require('./Transaction')

const {
  GetRuleTransactionsResolver,
  GetRuleInstanceResolver
} = require('./Rule')

const lambda = new AWS.Lambda()

module.exports = {
  Query: {
    transactionsByID: (parentValue, args, ctx) => {
      return GetTransactionsResolver(lambda, args, ctx.graphqlRequestSender)
    },
    transactionsByAccount: (parentValue, args, ctx) => {
      return GetTransactionsResolver(lambda, args, ctx.graphqlRequestSender)
    },
    requestsByID: (parentValue, args, ctx) => {
      return GetRequestResolver(lambda, args, ctx.graphqlRequestSender)
    },
    requestsByAccount: (parentValue, args, ctx) => {
      return GetRequestResolver(lambda, args, ctx.graphqlRequestSender)
    },
    rules: (parentValue, args) => {
      return GetRuleTransactionsResolver(args)
    },
    ruleInstances: (parentValue, args) => {
      return GetRuleInstanceResolver(args.keySchema)
    },
  },
  Mutation: {
    createRequest: (parentValue, args, ctx) => {
      return CreateRequestResolver(lambda, args, ctx.graphqlRequestSender)
    },
    approveRequest: (parentValue, args, ctx) => {
      return ApproveRequestResolver(lambda, args, ctx.graphqlRequestSender)
    }
  }
}