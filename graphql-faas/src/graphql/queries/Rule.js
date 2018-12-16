const { GraphQLList } = require('graphql')

const {
  TransactionType,
  TransactionCreateType
} = require('../types/Transaction')
const { GetRuleTransactionsResolver } = require('../resolvers/Rule')

const RuleQueryType = () => ({
  type: new GraphQLList(TransactionType),
  description: 'Returns a list of modified transactions',
  args: {
    transactions: {
      type: new GraphQLList(TransactionCreateType),
      description: 'Please, specify transactions'
    }
  },
  resolve(parent, args) {
    return GetRuleTransactionsResolver(args)
  }
})

module.exports = {
  RuleQueryType
}
