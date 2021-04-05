const {
  createItemRequestData,
} = require('../../tests/utils/testData');
const {
  CREDITOR
} = require('../constants');
const multiplyItemValue = require('./multiplyItemValue');

describe('multiplyItemValue', () => {
  test('returns added 9% tax item', () => {
    const testdebitor = 'JohnSmith';
    const testcreditor = 'GroceryCo';
    const testrulename = 'multiplyItemValue';
    const testrulecreditor = 'stateofcalifornia';
    const testruleitemname = '9% state sales tax';
    const testrulefactor = '0.09';
    const singleTestItem = createItemRequestData(
      testdebitor,
      testcreditor,
      CREDITOR,
    )[0];
    const addedItems = multiplyItemValue(
      1,
      testrulename,
      CREDITOR,
      testcreditor,
      singleTestItem,
      testcreditor,
      testrulecreditor,
      testruleitemname,
      testrulefactor,
    );
    expect(addedItems.length).toBe(expectedMultiplyItemValue.length)
    for (let i = 0; i < addedItems.length; i++) {
      expect(addedItems[i]).toEqual(expectedMultiplyItemValue[i])
    };
  });

  // todo: negative tests
});


const expectedMultiplyItemValue = [
  {
    "id": null,
    "transaction_id": null,
    "item_id": "9% state sales tax",
    "price": 0.18,
    "quantity": 1,
    "debitor_first": null,
    "rule_instance_id": 1,
    "unit_of_measurement": "",
    "units_measurement": "",
    "debitor": "GroceryCo",
    "creditor": "stateofcalifornia",
    "debitor_profile_id": 0,
    "creditor_profile_id": 0,
    "debitor_approval_time": "",
    "creditor_approval_time": "",
    "debitor_expiration_time": "",
    "creditor_expiration_time": "",
    "debitor_rejection_time": "",
    "creditor_rejection_time": ""
  },
]