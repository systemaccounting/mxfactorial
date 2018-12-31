const {
  GraphQLList,
  GraphQLString
} = require('graphql')

const { TransactionType } = require('../types/Transaction')
const {
  GetTransactionResolver,
  connection
} = require('../resolvers/Transaction')

const TransactionQueryType = () => {
  return {
    type: new GraphQLList(TransactionType),
    description: 'Returns transactions',
    args: {
      transactionId: {
        type: GraphQLString,
        description: 'Please specify transaction id'
      }
    },
    resolve(parentValue, args) {
      return GetTransactionResolver(args.transactionId, connection)
    }
  }
}

module.exports = {
  TransactionQueryType
}