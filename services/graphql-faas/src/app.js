const express = require('express')
const cors = require('cors')
const body_parser = require('body-parser-graphql')
const graphqlHTTP = require('express-graphql')
const { GraphQLSchema, GraphQLObjectType, GraphQLString } = require('graphql')

const schema = require('./graphql/schema')

// middleware wrapper required to access and export
// context object in case lambda requires context.succeed()
// to signal completed async operation
const appWrapper = (event, context) => {
  const app = express()
  app.use(cors())
  app.use(
    '/',
    graphqlHTTP({
      schema,
      graphiql: true,
      context: event
    })
  )
  app.use(body_parser.graphql())
  return app
}

module.exports = appWrapper
