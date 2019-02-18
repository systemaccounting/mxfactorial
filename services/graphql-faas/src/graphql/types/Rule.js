const { GraphQLObjectType, GraphQLID } = require('graphql')

const RuleType = new GraphQLObjectType({
  name: 'Rule',
  description: 'Rule',
  fields: {
    id: {
      type: GraphQLID,
      description: 'Rule ID'
    }
  }
})

module.exports = { RuleType }
