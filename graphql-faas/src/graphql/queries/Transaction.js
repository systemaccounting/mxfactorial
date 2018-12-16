const { GraphQLList, GraphQLString } = require('graphql')

const { TransactionType } = require('../types/Transaction')
const { GetTransactionResolver } = require('../resolvers/Transaction')

const TransactionQueryType = () => {
  return {
    type: new GraphQLList(TransactionType),
    description: 'Returns transactions',
    args: {
      transaction: {
        type: GraphQLString,
        description: 'Please specify transaction id'
      }
    },
    resolve(parentValue, args) {
      return GetTransactionResolver(args.transaction)
    }
  }
}

module.exports = {
  TransactionQueryType
}
