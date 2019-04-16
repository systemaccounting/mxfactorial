const { GraphQLList } = require('graphql')

const {
  TransactionType,
  TransactionInputType
} = require('../types/Transaction')
const { AddTransactionResolver } = require('../resolvers/Transaction')

const TransactionCreateMutation = () => {
  return {
    type: new GraphQLList(TransactionType),
    args: {
      items: {
        name: 'Transaction items',
        type: new GraphQLList(TransactionInputType)
      }
    },
    resolve(parentValue, args) {
      return AddTransactionResolver(args)
    }
  }
}

module.exports = {
  TransactionCreateMutation
}
