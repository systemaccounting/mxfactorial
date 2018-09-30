const {
  GraphQLNonNull
} = require('graphql')

const { TIMEUUID } = require('../resolvers/Transaction')

const {
  TransactionType,
  TransactionCreateType
} = require('../types/Transaction')
const {
  AddTransactionResolver
} = require('../resolvers/Transaction')

const TransactionCreateMutation = () => {
  return {
    type: TransactionType,
    args: {
      input: { type: new GraphQLNonNull(TransactionCreateType)}
    },
    resolve(parentValue, args) {
      var input = args.input
      input.id = TIMEUUID
      return AddTransactionResolver(input)
    }
  }
}

module.exports = {
  TransactionCreateMutation
}