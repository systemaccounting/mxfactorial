const {
  GraphQLList,
  GraphQLID,
  GraphQLString,
  GraphQLInputObjectType
} = require('graphql')

const {
  TransactionType,
  TransactionCreateType
} = require('../types/Transaction')
const { GetRuleTransactionsResolver } = require('../resolvers/Rule')

const TransactionItemType = new GraphQLInputObjectType({
  name: 'TransactionItem',
  description: 'Transaction Item',
  fields: {
    uuid: {
      type: GraphQLID,
      description: 'Transaction ID'
    },
    name: {
      type: GraphQLString,
      description: 'Name of good or service'
    },
    price: {
      type: GraphQLString,
      description: 'Value of good or service'
    },
    quantity: {
      type: GraphQLString,
      description: 'Quantity of good or service'
    }
  }
})

const RuleQueryType = () => ({
  type: new GraphQLList(TransactionType),
  description: 'Returns a list of modified transactions',
  args: {
    transactions: {
      type: new GraphQLList(TransactionItemType),
      description: 'Please, specify transactions'
    }
  },
  resolve: async (parent, args) => {
    return await GetRuleTransactionsResolver(args)
  }
})

module.exports = {
  RuleQueryType
}
