const applyItemRules = require('./applyItemRules');
const {
  DEBITOR,
  ID,
  RULE_NAME,
  ACCOUNT_ROLE,
  ACCOUNT_NAME,
  VARIABLE_VALUES,
} = require('./constants');
const { testItems } = require('../tests/utils/testData');
const mockFn = jest.fn(() => testItems[0]);

describe('applyItemRules', () => {
  test('calls itemRuleModule with args 1 time', async () => {
    testItems[0]["mock"] = mockFn; // smuggle in mock for assertion
    applyItemRules(
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
        ...testruleinstances[0][VARIABLE_VALUES],
    );
  });
});

const testruleinstances = [
  {
    [ID]: 0,
    [RULE_NAME]: 'applyItemRule.test',
    [ACCOUNT_ROLE]: DEBITOR,
    [ACCOUNT_NAME]: 'IgorPetrov',
    [VARIABLE_VALUES]: ['test1','test2','test3','test4'],
  },
];