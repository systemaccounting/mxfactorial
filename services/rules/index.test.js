const {
  testIntraTransaction,
  testItems,
} = require('./tests/utils/testData');
const {
  INCONSISTENT_SEQUENCE_ERROR,
} = require('./src/constants');

const mockTestDebitorFirstValues = jest.fn().mockImplementationOnce(() => {throw new Error()});
jest.mock('./src/testDebitorFirstValues', () => mockTestDebitorFirstValues);

const mockDbEnd = jest.fn();
const mockDbClient = jest.fn(() => ({ end: mockDbEnd }));
jest.mock('./src/db/index', () => ({ getClient: mockDbClient}));

const mockAddRuleItems= jest.fn()
  .mockImplementationOnce(() => {throw new Error()})
  .mockImplementation(() => ([]));
jest.mock('./src/addRuleItems', () => mockAddRuleItems);

const mockAddApproversAndRules= jest.fn()
  .mockImplementationOnce(() => {throw new Error()})
  .mockImplementation(() => ([]));
jest.mock('./src/addApproversAndRules', () => mockAddApproversAndRules);

jest.mock('./src/db/getItemApproverNames', () => jest.fn());

const mockLabelApprovedItems = jest.fn(() => ([]));
jest.mock('./src/labelApprovedItems', () => mockLabelApprovedItems);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('rules function handler', () => {
  test('returns null on empty event', async () => {
    const got = await require('./index').handler([]);
    expect(got).toBe(null);
  });

  test('returns error when testDebitorFirstValues throws', async () => {
    const got = await require('./index').handler(testItems);
    expect(got).toBe('Error');
  });

  test('returns error when addRuleItems throws and ends db session', async () => {
    const got = await require('./index').handler(testItems);
    expect(got).toBe('Error');
    expect(mockDbEnd).toHaveBeenCalled();
  });

  test('returns error when mockAddApproversAndRules throws and ends db session', async () => {
    const got = await require('./index').handler(testItems);
    expect(got).toBe('Error');
    expect(mockDbEnd).toHaveBeenCalled();
  });

  test('calls testDebitorFirstValues with args', async () => {
    await require('./index').handler(testItems);
    expect(mockTestDebitorFirstValues)
      .toHaveBeenCalledWith(testItems);
  });

  test('calls getClient on pool instance', async () => {
    await require('./index').handler(testItems);
    expect(mockDbClient)
      .toHaveBeenCalled();
  });

  test('calls addRuleItems with args', async () => {
    await require('./index').handler(testItems);
    expect(mockAddRuleItems.mock.calls[0][2])
      .toEqual(testItems);
    expect(mockAddRuleItems.mock.calls[0].length)
      .toBe(5);
  });

  test('calls end on db client', async () => {
    await require('./index').handler(testItems);
    expect(mockDbEnd).toHaveBeenCalled();
  });

  test('calls labelApprovedItems with args', async () => {
    await require('./index').handler(testItems);
    expect(mockLabelApprovedItems.mock.calls[0][0]).toEqual(testItems);
    expect(mockLabelApprovedItems.mock.calls[0].length).toBe(2);
  });

  test('returns labelApprovedItems in IntraTransaction object', async () => {
    const got = await require('./index').handler(testItems);
    expect(got).toEqual(testIntraTransaction);
  });
});