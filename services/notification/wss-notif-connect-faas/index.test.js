const rewire = require('rewire')
const unexportedFunctions = rewire('./index')
const Sequelize = require('sequelize')

jest.mock('sequelize', () => jest.fn(() => {
  return {
    define: jest.fn(() => ({ create: jest.fn(), destroy: jest.fn() }))
  }
}))

const createEvent = eventType => {
  return {
    requestContext: {
      connectionId: '123456789',
      eventType: eventType,
      connectedAt: 1573440182072
    }
  }
}

describe('unexported functions', () => {
  test('notificationWebsocketsModel called with params', () => {
    const notificationWebsocketsModel = unexportedFunctions
      .__get__('notificationWebsocketsModel')
    const mockSequelize = { define: jest.fn() }
    const mockType = {
      INTEGER: 'INTEGER',
      STRING: 'STRING',
      DATE: 'DATE',
      BIGINT: 'BIGINT',
    }
    const testtable = 'notification_websockets'
    const testsequelizemodel = {
      id: {
        type: 'INTEGER',
        primaryKey: true,
        autoIncrement: true
      },
      connection_id: 'STRING',
      created_at: 'DATE',
      epoch_created_at: 'BIGINT',
      account: 'STRING'
    }
    const testconfigobj = { timestamps: false }
    notificationWebsocketsModel(mockSequelize, mockType)
    expect(mockSequelize.define).toHaveBeenCalledWith(
      testtable,
      testsequelizemodel,
      testconfigobj
    )
  })

  test('notificationWebsocketsModel returns', () => {
    const notificationWebsocketsModel = unexportedFunctions
      .__get__('notificationWebsocketsModel')
    const mockSequelize = { define: jest.fn(() => 1) }
    const mockType = {
      INTEGER: 'INTEGER',
      STRING: 'STRING',
      DATE: 'DATE',
      BIGINT: 'BIGINT',
    }
    const result = notificationWebsocketsModel(mockSequelize, mockType)
    expect(result).toBe(1)
  })

  test('Sequelize called with params', () => {
    const testdb = 'testdb'
    const testuser = 'testuser'
    const testpwd = 'testpwd'
    const testhost = 'testhost'
    const testport = '5432' // $ VAR=5432 node -e 'console.log(typeof process.env.VAR)' // => string
    process.env.PGDATABASE = testdb
    process.env.PGUSER = testuser
    process.env.PGPASSWORD = testpwd
    process.env.PGHOST = testhost
    process.env.PGPORT = testport
    const expectedConfig = {
      host: testhost,
      operatorAliases: false,
      logging: console.log,
      port: testport,
      dialect: 'postgres',
      pool: {
        min: 0,
        max: 5,
        acquire: 30000,
        idle: 10000
      }
    }
    const testevent = {
      requestContext: {
        eventType: 'CONNECT',
        connectedAt: 123,
        connectionId: '123'
      }
    }
    const { handler } = require('./index') // require in test for scoped env vars
    handler(testevent)
    expect(Sequelize).toHaveBeenCalledWith(
      testdb,
      testuser,
      testpwd,
      expectedConfig
    )
  })
})

describe('lambda handler', () => {
  test('throws empty connectionId error', async () => {
    const unmatchedEvent = {
      requestContext: {
        connectionId: null,
        authorizer: {
          account: 'testaccount'
        },
        eventType: 'CONNECT',
        connectedAt: 1573440182072
      }
    }
    const { handler } = require('./index') // scoped to avoid error
    await expect(handler(unmatchedEvent))
      .rejects.toThrow('empty connectionId')
  })

  test('throws empty connectedAt error', async () => {
    const unmatchedEvent = {
      requestContext: {
        connectionId: '123456789',
        authorizer: {
          account: 'testaccount'
        },
        eventType: 'CONNECT',
        connectedAt: null
      }
    }
    const { handler } = require('./index') // scoped to avoid error
    await expect(handler(unmatchedEvent))
      .rejects.toThrow('empty connectedAt')
  })

  test('returns 200 on CONNECT', async () => {
    const testevent = createEvent('CONNECT')
    const { handler } = require('./index') // scoped to avoid error
    const result = await handler(testevent)
    await expect(result).toEqual({ statusCode: 200 })
  })

  test('returns 200 on DISCONNECT', async () => {
    const event = createEvent('DISCONNECT')
    const { handler } = require('./index') // scoped to avoid error
    const result = await handler(event)
    await expect(result).toEqual({ statusCode: 200 })
  })

  test('throws unmatched eventType error', async () => {
    const testevent = createEvent('')
    const { handler } = require('./index') // scoped to avoid error
    await expect(handler(testevent))
      .rejects.toThrow('unmatched eventType')
  })
})