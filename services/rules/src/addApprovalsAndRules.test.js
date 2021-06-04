const addApprovalsAndRules = require('./addApprovalsAndRules');
const {
  CASES,
  DEBITOR,
  CREDITOR,
  APPROVALS,
} = require('./constants');
const { testItems } = require('../tests/utils/testData');

describe('addApprovalsAndRules', () => {
  test('calls getNamesFn with args 4 times', async () => {
    const testdb = {};
    const mockGetNamesFn = jest.fn(() => Promise.resolve({}));
    const testCreateObjFn = () => {};
    const testGetRulesFn = () => {};
    const testApplyRulesFn = () => {};
    await addApprovalsAndRules(
      CASES,
      testdb,
      testItems,
      mockGetNamesFn,
      testCreateObjFn,
      testGetRulesFn,
      testApplyRulesFn,
    );
    expect(mockGetNamesFn)
      .toHaveBeenNthCalledWith(1, testdb, testItems[0][DEBITOR]);
    expect(mockGetNamesFn)
      .toHaveBeenNthCalledWith(2, testdb, testItems[1][DEBITOR]);
    expect(mockGetNamesFn)
      .toHaveBeenNthCalledWith(3, testdb, testItems[0][CREDITOR]);
    expect(mockGetNamesFn)
      .toHaveBeenNthCalledWith(4, testdb, testItems[1][CREDITOR]);
  });

  test('calls createObjFn with args 8 times', async () => {
    const testdb = {};
    const testaccounts = [ 'GroceryCo', 'JohnSmith' ];
    const mockGetNamesFn = jest.fn(() => Promise.resolve(
      [
        testaccounts[0],
        testaccounts[1],
      ]
    ));
    const mockCreateObjFn = jest.fn();
    const testGetRulesFn = () => {};
    const testApplyRulesFn = () => {};
    await addApprovalsAndRules(
      CASES,
      testdb,
      testItems,
      mockGetNamesFn,
      mockCreateObjFn,
      testGetRulesFn,
      testApplyRulesFn,
    );
    for (let i = 0; i < 4; i++) {
      expect(mockCreateObjFn.mock.calls[i][4]).toBe(testaccounts[i%2]);
      expect(mockCreateObjFn.mock.calls[i][5]).toBe(DEBITOR);
    };
    for (let j = 4; j < 8; j++) {
      expect(mockCreateObjFn.mock.calls[j][4]).toBe(testaccounts[j%2]);
      expect(mockCreateObjFn.mock.calls[j][5]).toBe(CREDITOR);
    };
  });

  test('calls getRulesFn with args 8 times', async () => {
    const testdb = {};
    const testaccounts = [ 'GroceryCo', 'JohnSmith' ];
    const mockGetNamesFn = jest.fn(() => Promise.resolve(
      [
        testaccounts[0],
        testaccounts[1],
      ]
    ));
    const mockCreateObjFn = jest.fn();
    const mockGetRulesFn = jest.fn();
    const testApplyRulesFn = () => {};
    await addApprovalsAndRules(
      CASES,
      testdb,
      testItems,
      mockGetNamesFn,
      mockCreateObjFn,
      mockGetRulesFn,
      testApplyRulesFn,
    );
    for (let i = 0; i < 4; i++) {
      expect(mockGetRulesFn.mock.calls[i][0]).toBe(testdb);
      expect(mockGetRulesFn.mock.calls[i][1]).toBe(DEBITOR);
      expect(mockGetRulesFn.mock.calls[i][2]).toBe(testaccounts[i%2]);
    };
    for (let j = 4; j < 8; j++) {
      expect(mockGetRulesFn.mock.calls[j][0]).toBe(testdb);
      expect(mockGetRulesFn.mock.calls[j][1]).toBe(CREDITOR);
      expect(mockGetRulesFn.mock.calls[j][2]).toBe(testaccounts[j%2]);
    };
  });

  test('returns items with approvals', async () => {
    const testdb = {};
    const testaccounts = [ 'GroceryCo', 'JohnSmith' ];
    const testapprover = { approver: testaccounts[0] }
    const mockGetNamesFn = jest.fn(() => Promise.resolve(
      [
        testaccounts[0],
        testaccounts[1],
      ]
    ));
    const mockCreateObjFn = jest.fn();
    const mockGetRulesFn = jest.fn();
    const mockApplyRulesFn = jest.fn(() => testapprover);
    const got = await addApprovalsAndRules(
      CASES,
      testdb,
      testItems,
      mockGetNamesFn,
      mockCreateObjFn,
      mockGetRulesFn,
      mockApplyRulesFn,
    );
    const want = new Array();
    // deep copy testItems into want
    for (const i of testItems) {
      const j = Object.assign({}, i);
      want.push(j);
    }
    // add approvers to want
    for (const w of want) {
      w[APPROVALS] = new Array();
      for (let x = 0; x < 4; x++) {
        w[APPROVALS].push(testapprover);
      };
    };
    expect(got).toEqual(want);
  });
});