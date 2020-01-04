const updateRequest = require('./updateRequest.js')
const RequestModel = require('./models/Request')

jest.mock('sequelize', () => ({}))
jest.mock('./models/Request', () => jest.fn(() => ({
  define: jest.fn(),
  update: jest.fn()
})))

afterEach(() => {
  jest.clearAllMocks()
})

describe('updateRequest', () => {
  test('calls RequestModel with args', () => {
    const testsequelizeinstance = {}
    const testtimestamp = '1234'
    const testtransactionid = 'testtransactionid'
    updateRequest({}, testtransactionid, testtimestamp)
    expect(RequestModel).toHaveBeenCalledWith(
      testsequelizeinstance,
      {}
    )
  })

  test('calls update with args', () => {
    const testtransactionid = 'testtransactionid'
    const expected = {
      where: { transaction_id: testtransactionid },
      returning: 1
    }
    updateRequest({}, testtransactionid, testtransactionid)
    expect(
      RequestModel.mock.results[0]
        .value.update.mock.calls[0][0][testtransactionid]
    ).toBeTruthy()
    expect(
      RequestModel.mock.results[0]
        .value.update.mock.calls[0][0][testtransactionid].getTime().toString()
    ).toMatch(/\d{13}/) // test for new Date() after converting to string
    expect(RequestModel.mock.results[0].value.update.mock.calls[0][1])
      .toEqual(expected)
  })
})