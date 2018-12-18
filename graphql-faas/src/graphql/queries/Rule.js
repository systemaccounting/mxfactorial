const { GraphQLList } = require('graphql')

const {
  TransactionType,
  TransactionCreateType
} = require('../types/Transaction')
const { GetRuleTransactionsResolver } = require('../resolvers/Rule')

const TransactionItemType = new GraphQLObjectType({
  name: 'TransactionItem',
  description: 'Transaction Item',
  fields: {
    id: {
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
    },
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
  resolve(parent, args) {
    return GetRuleTransactionsResolver(args)
  }
})

module.exports = {
  RuleQueryType
}
