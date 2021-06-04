const {
  ACCOUNT_ROLE_TRS_SQL,
  APPROVAL,
  CREDITOR,
} = require('../constants');
const getRulesPerApproval = require('./getRulesPerApproval');

describe('getRulesPerApproval', () => {
  test('called with constants as query args', async () => {
    const testapprover = 'testapprover';
    const db = jest.fn(() => Promise.resolve({ rows: [] }));
    const mockDB = { query: db };
    await getRulesPerApproval(mockDB, CREDITOR, testapprover);
    expect(mockDB.query.mock.calls[0][0]).toBe(ACCOUNT_ROLE_TRS_SQL);
    expect(mockDB.query.mock.calls[0][1]).toEqual([
      APPROVAL,
      CREDITOR,
      testapprover,
    ]);
  });

  test('returns list of item approver names', async () => {
    const testapprover = 'testapprover';
    const db = jest.fn(() => Promise.resolve({ rows: [] }));
    const mockDB = { query: db };
    const got = await getRulesPerApproval(mockDB, CREDITOR, testapprover);
    expect(got.length).toBe(0);
  });
});