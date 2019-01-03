const {
  GraphQLNonNull
} = require('graphql')

const {
  TransactionType,
  TransactionCreateType
} = require('../types/Transaction')
const {
  AddTransactionResolver,
  connection
} = require('../resolvers/Transaction')

const TransactionCreateMutation = () => {
  return {
    type: TransactionType,
    args: {
      input: { type: new GraphQLNonNull(TransactionCreateType)}
    },
    resolve(parentValue, args) {
      return AddTransactionResolver(args.input, connection)
    }
  }
}

module.exports = {
  TransactionCreateMutation
}