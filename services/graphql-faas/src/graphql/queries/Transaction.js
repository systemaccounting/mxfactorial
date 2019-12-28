const AWS = require('aws-sdk')
const { GraphQLList, GraphQLString } = require('graphql')

const { TransactionType } = require('../types/Transaction')
const GetTransactionsResolver = require('../resolvers/Transaction')

const lambda = new AWS.Lambda()

const TransactionQueryByIDType = () => {
  return {
    type: new GraphQLList(TransactionType),
    description: 'returns transactions by id',
    args: {
      transactionID: {
        type: GraphQLString,
        description: 'please specify transaction id'
      }
    },
    resolve(parentValue, args, ctx) {
      return GetTransactionsResolver(lambda, args, ctx.graphqlRequestSender)
    }
  }
}

const TransactionQueryByAccountType = () => {
  return {
    type: new GraphQLList(TransactionType),
    description: 'returns transactions involving account',
    args: {
      account: {
        type: GraphQLString,
        description: 'please specify account name'
      }
    },
    resolve(parentValue, args, ctx) {
      return GetTransactionsResolver(lambda, args, ctx.graphqlRequestSender)
    }
  }
}

module.exports = {
  TransactionQueryByIDType,
  TransactionQueryByAccountType
}
