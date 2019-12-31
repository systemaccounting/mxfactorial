const getRequest = require('./getRequest.js')
const RequestModel = require('./models/Request')

jest.mock('sequelize', () => ({}))
jest.mock('./models/Request', () => jest.fn(() => ({
  define: jest.fn(),
  findAll: jest.fn()
})))

afterEach(() => {
  jest.clearAllMocks()
})

describe('getRequest', () => {
  test('calls RequestModel with args', () => {
    const testsequelizeinstance = {}
    const testtransactionid = 'testtransactionid'
    getRequest({}, testtransactionid)
    expect(RequestModel).toHaveBeenCalledWith(
      testsequelizeinstance,
      {}
    )
  })

  test('calls findAll with args', () => {
    const testtransactionid = 'testtransactionid'
    const expected = {
      where: { transaction_id: testtransactionid }
    }
    getRequest({}, testtransactionid)
    expect(RequestModel.mock.results[0].value.findAll.mock.calls[0][0])
      .toEqual(expected)
  })
})