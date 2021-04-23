const mockQuery = jest.fn(() => Promise.resolve({}));
const mockConnect = jest.fn(() => Promise.resolve({}));
const mockPool = jest.fn(() => ({
  query: mockQuery,
  connect: mockConnect,
}));
jest.mock('pg', () => ({ Pool: mockPool }));

describe('db', () => {
  test('pool called with args', () => {
    const want = {
      user: 'test',
      password: 'test',
      host: 'localhost',
      database: 'mxfactorial',
      port: '5432',
      max: '20',
      idleTimeoutMillis: '100',
      connectionTimeoutMillis: '100',
    };
    require('./index');
    const got = mockPool.mock.calls[0][0];
    expect(got).toEqual(want);
  });

  test('query method called with args', async () => {
    const pg = require('./index');
    const want = [ 0, 1 ];
    await pg.query(...want);
    const got = mockQuery.mock.calls[0];
    expect(got).toEqual(want);
  });

  test('connect method called', async () => {
    const pg = require('./index');
    await pg.getClient();
    expect(mockConnect).toHaveBeenCalled();
  });
});