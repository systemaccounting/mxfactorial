const { GraphQLObjectType, GraphQLSchema, GraphQLID } = require('graphql')

const {
  TransactionQueryByIDType,
  TransactionQueryByAccountType
} = require('./queries/Transaction')

const {
  RequestQueryByIDType,
  RequestQueryByAccountType
} = require('./queries/Request')
const {
  RequestCreateMutation,
  RequestApproveMutation
} = require('./mutations/Request')
const {
  RuleQueryType,
  RuleInstanceQueryType
} = require('./queries/Rule')

const Query = new GraphQLObjectType({
  name: 'read',
  description: 'queries',
  fields: {
    transactionsByID: TransactionQueryByIDType(),
    transactionsByAccount: TransactionQueryByAccountType(),
    requestsByID: RequestQueryByIDType(),
    requestsByAccount: RequestQueryByAccountType(),
    rules: RuleQueryType(),
    ruleInstances: RuleInstanceQueryType()
  }
})

const Mutation = new GraphQLObjectType({
  name: 'write',
  description: 'mutations',
  fields: {
    createRequest: RequestCreateMutation(),
    approveRequest: RequestApproveMutation()
  }
})

module.exports = new GraphQLSchema({
  query: Query,
  mutation: Mutation
})
