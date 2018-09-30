const express = require('express')
const body_parser = require('body-parser-graphql')
const graphqlHTTP = require('express-graphql')

const schema = require('./graphql/schema')

// middleware wrapper required to access and export
// context object in case lambda requires context.succeed()
// to signal completed async operation
const appWrapper = (event, context) => {
  const app = express()

  app.use('/', graphqlHTTP({
    graphiql: true,
    schema: schema
  }))
  app.use(body_parser.graphql())
  return app
}

module.exports = {
  appWrapper
}