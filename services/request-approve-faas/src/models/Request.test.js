const RequestsModel = require('./Request')

describe('RequestsModel', () => {

  const mockModel = {
    define: jest.fn()
  }
  const testtable = 'transaction'
  const testrequesteraccount = 'testaccount'
  const type = {
    INTEGER: 'INTEGER',
    STRING: 'STRING',
    DATE: 'DATE'
  }
  const testmodel = {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: type.STRING,
    price: type.STRING,
    quantity: type.STRING,
    author: type.STRING,
    creditor: type.STRING,
    debitor: type.STRING,
    debitor_approval_time: type.DATE,
    creditor_approval_time: type.DATE,
    transaction_id: type.STRING,
    rule_instance_id: type.STRING
  }
  const testopts = { timestamps: 0 }

  test('sequelize define called with args', () => {
    RequestsModel(mockModel, type, testrequesteraccount)
    expect(mockModel.define).toHaveBeenCalledWith(
      testtable,
      testmodel,
      testopts
    )
  })
})