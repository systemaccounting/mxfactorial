const {
  RULE_INSTANCE_SQL,
  APPROVER,
  CREDITOR,
} = require('../constants');
const getRulesPerApprover = require('./getRulesPerApprover');

describe('getRulesPerApprover', () => {
  test('called with constants as query args', async () => {
    const testapprover = 'testapprover';
    const db = jest.fn(() => Promise.resolve({ rows: [] }));
    const mockDB = { query: db };
    await getRulesPerApprover(mockDB, CREDITOR, testapprover);
    expect(mockDB.query.mock.calls[0][0]).toBe(RULE_INSTANCE_SQL);
    expect(mockDB.query.mock.calls[0][1]).toEqual([
      APPROVER,
      CREDITOR,
      testapprover,
    ]);
  });

  test('returns list of item approver names', async () => {
    const testapprover = 'testapprover';
    const db = jest.fn(() => Promise.resolve({ rows: [] }));
    const mockDB = { query: db };
    const got = await getRulesPerApprover(mockDB, CREDITOR, testapprover);
    expect(got.length).toBe(0);
  });
});