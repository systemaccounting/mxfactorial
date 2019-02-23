const { GraphQLList } = require('graphql')

const {
  TransactionType,
  TransactionCreateType
} = require('../types/Transaction')
const { AddTransactionResolver } = require('../resolvers/Transaction')

const TransactionCreateMutation = () => {
  return {
    type: TransactionType,
    args: {
      items: {
        name: 'Transaction items',
        type: new GraphQLList(TransactionCreateType)
      }
      // input: { type: new GraphQLNonNull(TransactionCreateType)}
    },
    resolve(parentValue, args) {
      return AddTransactionResolver(args)
    }
  }
}

module.exports = {
  TransactionCreateMutation
}
