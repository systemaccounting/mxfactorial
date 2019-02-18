const { GraphQLObjectType, GraphQLSchema } = require('graphql')

const { TransactionQueryType } = require('./queries/Transaction')
const { RuleQueryType } = require('./queries/Rule')
const { TransactionCreateMutation } = require('./mutations/Transaction')

const RootQuery = new GraphQLObjectType({
  name: 'Read',
  description: 'Root query of app',
  fields: {
    transactions: TransactionQueryType(),
    rules: RuleQueryType()
  }
})

const RootMutation = new GraphQLObjectType({
  name: 'Write',
  description: 'Root mutation of app',
  fields: {
    createTransaction: TransactionCreateMutation()
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation
})
