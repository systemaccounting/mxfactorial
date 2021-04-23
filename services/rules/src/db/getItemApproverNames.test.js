const {
  APPROVER_SQL,
  APPROVER_COUNT_ERROR,
} = require('../constants');
const getItemApproverNames = require('./getItemApproverNames');

describe('getItemApproverNames', () => {
  test('called with constants as query args', async () => {
    const testownedaccount = 'testownedaccount';
    const db = jest.fn(() => Promise.resolve({ rows: ['any']}));
    const mockDB = { query: db };
    await getItemApproverNames(mockDB, testownedaccount);
    expect(mockDB.query.mock.calls[0][0]).toBe(APPROVER_SQL);
    expect(mockDB.query.mock.calls[0][1]).toEqual([testownedaccount]);
  });

  test('throws on zero approver rows returned from query', async () => {
    const testownedaccount = 'testownedaccount';
    const db = jest.fn(() => Promise.resolve({ rows: [/* empty */]}));
    const mockDB = { query: db };
    await expect(getItemApproverNames(mockDB, testownedaccount)).rejects.toThrow(APPROVER_COUNT_ERROR);
  });

  test('returns list of item approver names', async () => {
    const want = ['JohnSmith', 'IrisLynn', 'DanLee'];
    const testownedaccount = 'testownedaccount';
    const db = jest.fn(() => Promise.resolve({
      rows: [
        { approver: want[0] },
        { approver: want[1] },
        { approver: want[2] },
      ]
    }));
    const mockDB = { query: db };
    const got = await getItemApproverNames(mockDB, testownedaccount);
    expect(got).toEqual(want);
  });
});