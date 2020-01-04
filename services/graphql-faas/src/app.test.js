const appWrapper = require('./app')

const express = require('express')
const cors = require('cors')
const body_parser = require('body-parser-graphql')
const graphqlHTTP = require('express-graphql')
const graphqlTools = require('graphql-tools')

const typeDefs = require('./graphql/types')
const resolvers = require('./graphql/resolvers')

const mockUse = jest.fn()
jest.mock('express', () => jest.fn(
  () => ({ use: mockUse })
))

jest.mock('cors', () => jest.fn())
jest.mock('body-parser-graphql', () => ({ graphql : jest.fn(() => ({})) }))
jest.mock('express-graphql')

jest.mock('graphql-tools', () => ({
  makeExecutableSchema: jest.fn(() => ({}))
}))

jest.mock('./graphql/types', () => ({}))
jest.mock('./graphql/resolvers', () => ({}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('appWrapper', () => {
  const testevent = {}
  const testctx = {}

  it('calls express', () => {
    appWrapper(testevent, testctx)
    expect(express).toHaveBeenCalled()
  })

  it('calls use with cors', () => {
    appWrapper(testevent, testctx)
    expect(mockUse).toHaveBeenCalled()
    expect(cors).toHaveBeenCalled()
  })

  it(
    'calls graphqlHTTP and makeExecutableSchema with args in app use',
    () => {
    const expectedHttpConfig = {
      schema: {},
      graphiql: true,
      context: {}
    }
    const expectedSchemaConfig = {
      resolvers: {},
      typeDefs: {}
    }
    appWrapper(testevent, testctx)
    expect(graphqlTools.makeExecutableSchema)
      .toHaveBeenCalledWith(expectedSchemaConfig)
    expect(mockUse.mock.calls[1][0]).toBe('/')
    expect(graphqlHTTP).toHaveBeenCalledWith(expectedHttpConfig)
  })

  it('calls graphql on body_parser in app use', () => {
    appWrapper(testevent, testctx)
    expect(mockUse.mock.calls[2][0]).toEqual({})
    // app.use(body_parser.graphql())
    expect(body_parser.graphql).toHaveBeenCalled()
  })

  it('returns app object', () => {
    const result = appWrapper(testevent, testctx)
    expect(result.use).toBeTruthy()
  })
})