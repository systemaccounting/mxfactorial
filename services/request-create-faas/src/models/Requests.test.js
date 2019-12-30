const RequestsModel = require('./Requests')

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

  test('sequelize define called with args', () => {

    RequestsModel(mockModel, type, testrequesteraccount)

    expect(mockModel.define.mock.calls[0][0]).toBe(testtable)
    expect(mockModel.define.mock.calls[0][1]).toEqual(testmodel)
    expect(mockModel.define.mock.calls[0][2].timestamps).toBe(false)
    expect(mockModel.define.mock.calls[0][2].hooks).toBeTruthy()
    expect(mockModel.define.mock.calls[0][2].hooks.beforeCreate).toBeTruthy()
  })

  test('sequelize hook adds creditor_approval_time', () => { // depends on mockModel in prev test
    const mockSetCreditor = jest.fn()
    const testinstancecreditor = {
      creditor: 'testaccount',
      debitor: 'notmatching',
      set: mockSetCreditor
    }
    const testmodeloptscreditor = {}
    const creditorApproverColumnName = 'creditor_approval_time'
    mockModel.define.mock.calls[0][2].hooks.beforeCreate(testinstancecreditor, testmodeloptscreditor)
    expect(testinstancecreditor.set.mock.calls[0][0]).toBe(creditorApproverColumnName)
    expect(testinstancecreditor.set.mock.calls[0][1].getTime().toString()).toMatch(/\d{13}/)
  })

  test('sequelize hook adds debitor_approval_time', () => { // depends on mockModel in first test
    const mockSetDebitor = jest.fn()
    const testinstancedebitor = {
      creditor: 'notmatching',
      debitor: 'testaccount',
      set: mockSetDebitor
    }
    const testmodeloptsdebitor = {}
    const debitorApproverColumnName = 'debitor_approval_time'
    mockModel.define.mock.calls[0][2].hooks.beforeCreate(testinstancedebitor, testmodeloptsdebitor)
    expect(testinstancedebitor.set.mock.calls[0][0]).toBe(debitorApproverColumnName)
    expect(testinstancedebitor.set.mock.calls[0][1].getTime().toString()).toMatch(/\d{13}/)
  })
})