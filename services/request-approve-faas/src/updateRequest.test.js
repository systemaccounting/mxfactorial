const storeRequest = require('./updateRequest')
const Sequelize = require('sequelize')

jest.mock('sequelize', () => {
  return jest.fn().mockImplementation(
    () => {
      return {
        close: jest.fn().mockImplementation(
          () => {
            return {
              then: jest.fn()
            }
          }
        )
      }
    }
  )
})

jest.mock('./models/UpdateRequest', () => {
  return jest.fn().mockImplementation(
    () => {
      return {
        bulkCreate: jest.fn()
      }
    }
  )
})

describe('storeRequest', () => {
  test('sequelize passed params', async () => {
    process.env.PGDATABASE = 'testdb'
    process.env.PGUSER = 'testuser'
    process.env.PGPASSWORD = 'testpassword'
    process.env.PGHOST = 'testhost'
    process.env.PGPORT = 'testport'
    let expectedConfig =     {
      host: 'testhost',
      operatorsAliases: false,
      logging: console.log,
      port: 'testport',
      dialect: 'postgres',
      pool: {
        min: 0,
        max: 5,
        acquire: 30000,
        idle: 10000,
        handleDisconnects: true
      }
    }
    await storeRequest()
    expect(Sequelize).toHaveBeenCalledWith(
      'testdb',
      'testuser',
      'testpassword',
      expectedConfig
    )
  })
})