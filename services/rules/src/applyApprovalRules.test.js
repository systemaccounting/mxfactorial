const applyApprovalRules = require('./applyApprovalRules');
const {
  DEBITOR,
  ID,
  RULE_NAME,
  ACCOUNT_ROLE,
  ACCOUNT_NAME,
  VARIABLE_VALUES,
} = require('./constants');
const { testItems } = require('../tests/utils/testData');
const mockFn = jest.fn(() => testapprover);

describe('applyApprovalRules', () => {
  test('calls approverRuleModule with args 1 time', async () => {
    testItems[0]["mock"] = mockFn; // smuggle in mock for assertion
    applyApprovalRules(
      testapprover,
      testruleinstances,
      testItems[0],
    );
    let copiedItem = Object.assign({}, testItems[0]);
    delete(copiedItem.mock); // discard mock after smuggling
    expect(mockFn)
      .toHaveBeenCalledWith(
        testruleinstances[0][ID],
        testruleinstances[0][RULE_NAME],
        testruleinstances[0][ACCOUNT_ROLE],
        testruleinstances[0][ACCOUNT_NAME],
        copiedItem,
        testapprover,
        ...testruleinstances[0][VARIABLE_VALUES],
    );
  });
});

// todo: standardize keys from constants
const testapprover = {
  id: null,
  rule_instance_id: 2,
  transaction_id: null,
  transaction_item_id: null,
  account_name: 'IgorPetrov',
  account_role: DEBITOR,
  device_id: null,
  device_latlng: null,
  approval_time: null,
  rejection_time: null,
  expiration_time: null
};

const testruleinstances = [
  {
    id: 0,
    rule_name: 'applyApprovalRule.test',
    account_role: DEBITOR,
    account_name: 'IgorPetrov',
    variable_values: ['test1','test2','test3'],
  },
];