const { GraphQLList, GraphQLString } = require('graphql')

const { TransactionType } = require('../types/Transaction')
const { GetTransactionResolver } = require('../resolvers/Transaction')

const TransactionQueryType = () => {
  return {
    type: new GraphQLList(TransactionType),
    description: 'Returns transactions',
    args: {
      transactionId: {
        type: GraphQLString,
        description: 'Please specify transaction id'
      },
      user: {
        type: GraphQLString,
        description: 'Please specify user name'
      }
    },
    resolve(parentValue, args) {
      return GetTransactionResolver(args)
    }
  }
}

module.exports = {
  TransactionQueryType
}
