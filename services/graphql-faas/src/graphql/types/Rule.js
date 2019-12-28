const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLNonNull
} = require('graphql')

const RuleInstanceType = new GraphQLObjectType({
  name: 'RuleInstance',
  description: 'view rule contents',
  fields: {
    key_schema: {
      type: GraphQLString,
      description: 'colon seperated list of transaction item fields affected by rule, e.g. name:price'
    },
    rule_instance_id: {
      type: GraphQLString,
      description: 'id of rule instance record'
    },
    description: {
      type: GraphQLString,
      description: 'description of rule'
    },
    rule: {
      type: GraphQLString,
      description: 'rule contents'
    }
  }
})

const RuleInstanceInputType = new GraphQLInputObjectType({
  name: 'RuleInstanceInputType',
  type: RuleInstanceType,
  fields: {
    key_schema: { type: new GraphQLNonNull(GraphQLString) },
  }
})

module.exports = {
  RuleInstanceType,
  RuleInstanceInputType
}
