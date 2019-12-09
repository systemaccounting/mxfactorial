const Sequelize = require('sequelize')
jest.mock('sequelize')

describe('postgres', () => {
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
    require('./postgres')
    expect(Sequelize).toHaveBeenCalledWith(
      testdb,
      testuser,
      testpwd,
      expectedConfig
    )
  })

  test('tableModel called with params', () => {
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
    const { tableModel } = require('./postgres')
    tableModel(mockSequelize, mockType, testtable)
    expect(mockSequelize.define).toHaveBeenCalledWith(
      testtable,
      testsequelizemodel,
      testconfigobj
    )
  })

  test('tableModel returns', () => {
    const mockSequelize = { define: jest.fn(() => 1) }
    const mockType = {
      INTEGER: 'INTEGER',
      STRING: 'STRING',
      DATE: 'DATE',
      BIGINT: 'BIGINT',
    }
    const testtable = 'notification_websockets'
    const { tableModel } = require('./postgres')
    const result = tableModel(mockSequelize, mockType, testtable)
    expect(result).toBe(1)
  })
})