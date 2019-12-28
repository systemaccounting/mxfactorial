const { GraphQLList } = require('graphql')
const AWS = require('aws-sdk')

const {
  RequestCreateType,
  RequestQueryType,
  RequestCreateInputType,
  RequestApproveInputType
} = require('../types/Request')

const {
  CreateRequestResolver,
  ApproveRequestResolver
} = require('../resolvers/Request')

const lambda = new AWS.Lambda()

const RequestCreateMutation = () => {
  return {
    type: new GraphQLList(RequestCreateType),
    args: {
      items: {
        name: 'request items for approval',
        type: new GraphQLList(RequestCreateInputType)
      }
    },
    resolve(parentValue, args, ctx) {
      return CreateRequestResolver(lambda, args, ctx.graphqlRequestSender)
    }
  }
}

const RequestApproveMutation = () => {
  return {
    type: new GraphQLList(RequestQueryType),
    args: {
      items: {
        name: 'approve requested items',
        type: new GraphQLList(RequestApproveInputType)
      }
    },
    resolve(parentValue, args, ctx) {
      return ApproveRequestResolver(lambda, args, ctx.graphqlRequestSender)
    }
  }
}

module.exports = {
  RequestCreateMutation,
  RequestApproveMutation
}
