const {
  GraphQLList,
  GraphQLString,
} = require('graphql')

const {
  TransactionType,
  TransactionInputType
} = require('../types/Transaction')

const {
  RuleInstanceType,
} = require('../types/Rule')

const {
  GetRuleTransactionsResolver,
  GetRuleInstanceResolver
} = require('../resolvers/Rule')

const RuleQueryType = () => ({
  type: new GraphQLList(TransactionType),
  description: 'returns a list of rules-adjusted transactions',
  args: {
    transactions: {
      type: new GraphQLList(TransactionInputType),
      description: 'please specify transactions'
    }
  },
  resolve: async (parentValue, args) => {
    return GetRuleTransactionsResolver(args)
  }
})

const RuleInstanceQueryType = () => ({
  type: new GraphQLList(RuleInstanceType),
  description: 'returns rule instance contents',
  args: {
    keySchema: {
      type: new GraphQLList(GraphQLString),
      description: 'please specifiy key schema of rule instance, e.g. "name:"'
    }
  },
  resolve: async(parentValue, args) => {
    return GetRuleInstanceResolver(args.keySchema)
  }
})

module.exports = {
  RuleQueryType,
  RuleInstanceQueryType
}