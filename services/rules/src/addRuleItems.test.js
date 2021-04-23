const addRuleItems = require('./addRuleItems');
const {
  CASES,
  DEBITOR,
  CREDITOR,
} = require('./constants');
const { testItems } = require('../tests/utils/testData');

describe('addRuleItems', () => {
  test('calls getRulesFn with args 4 times', async () => {
    const testdb = {};
    const mockGetRulesFn = jest.fn(() => Promise.resolve({}));
    const mockApplyRulesFn = jest.fn(() => testitems);
    await addRuleItems(
      CASES,
      testdb,
      testitems,
      mockGetRulesFn,
      mockApplyRulesFn,
    );
    expect(mockGetRulesFn)
      .toHaveBeenNthCalledWith(1, testdb, DEBITOR, 'JohnSmith');
    expect(mockGetRulesFn)
      .toHaveBeenNthCalledWith(2, testdb, DEBITOR, 'JohnSmith');
    expect(mockGetRulesFn)
      .toHaveBeenNthCalledWith(3, testdb, CREDITOR, 'GroceryCo');
    expect(mockGetRulesFn)
      .toHaveBeenNthCalledWith(4, testdb, CREDITOR, 'GroceryCo');
  });

  test('returns getRulesFn throw', async () => {
    const testdb = { end: () => Promise.resolve({}) };
    const mockGetRulesFn = jest.fn(() => Promise.reject(new Error()));
    const mockApplyRulesFn = jest.fn(() => testitems);
    const got = await addRuleItems(
      CASES,
      testdb,
      testitems,
      mockGetRulesFn,
      mockApplyRulesFn,
    );
    expect(got).toBe('Error');
  });

  test('calls applyRulesFn with args 4 times', async () => {
    const testdb = {};
    const testrules = [];
    const mockGetRulesFn = jest.fn(() => Promise.resolve(testrules));
    const mockApplyRulesFn = jest.fn(() => testitems);
    await addRuleItems(
      CASES,
      testdb,
      testitems,
      mockGetRulesFn,
      mockApplyRulesFn,
    );
    for (let i = 0; i < 4; i++) {
      expect(mockApplyRulesFn)
        .toHaveBeenNthCalledWith(i+1, testrules, testitems[i%2]);
    };
  });
});


// todo: create from function
const testitems = [
  {
    id: 0,
    transaction_id: 123,
    item_id: 'milk',
    price: 2,
    quantity: 1,
    debitor_first: null,
    rule_instance_id: '',
    unit_of_measurement: '',
    units_measured: 0,
    debitor: 'JohnSmith',
    creditor: 'GroceryCo',
    debitor_profile_id: 0,
    creditor_profile_id: 0,
    debitor_approval_time: '',
    creditor_approval_time: null,
    debitor_expiration_time: '',
    creditor_expiration_time: '',
    debitor_rejection_time: '',
    creditor_rejection_time: ''
  },
  {
    id: 1,
    transaction_id: 123,
    item_id: 'bread',
    price: 3,
    quantity: 2,
    debitor_first: null,
    rule_instance_id: '',
    unit_of_measurement: '',
    units_measured: 0,
    debitor: 'JohnSmith',
    creditor: 'GroceryCo',
    debitor_profile_id: 0,
    creditor_profile_id: 0,
    debitor_approval_time: '',
    creditor_approval_time: null,
    debitor_expiration_time: '',
    creditor_expiration_time: '',
    debitor_rejection_time: '',
    creditor_rejection_time: ''
  }
]