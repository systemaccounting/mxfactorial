const { GraphQLList, GraphQLString } = require('graphql')
const AWS = require('aws-sdk')

const { RequestQueryType } = require('../types/Request')
const { GetRequestResolver } = require('../resolvers/Request')

const lambda = new AWS.Lambda()

const RequestQueryByIDType = () => {
  return {
    type: new GraphQLList(RequestQueryType),
    description: 'returns transaction requests by id',
    args: {
      transactionID: {
        type: GraphQLString,
        description: 'please specify requested transaction id'
      }
    },
    resolve(parentValue, args, ctx) {
      return GetRequestResolver(lambda, args, ctx.graphqlRequestSender)
    }
  }
}

const RequestQueryByAccountType = () => {
  return {
    type: new GraphQLList(RequestQueryType),
    description: 'returns transactions requests by account',
    args: {
      account: {
        type: GraphQLString,
        description: 'please specify account name'
      }
    },
    resolve(parentValue, args, ctx) {
      return GetRequestResolver(lambda, args, ctx.graphqlRequestSender)
    }
  }
}

module.exports = {
  RequestQueryByIDType,
  RequestQueryByAccountType
}