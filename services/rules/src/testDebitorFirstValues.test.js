const {
  DEBITOR_FIRST,
  INCONSISTENT_SEQUENCE_ERROR,
  CASES,
} = require('./constants');
const testDebitorFirstValues = require('./testDebitorFirstValues');

describe('testDebitorFirstValues', () => {
  test('returns CREDITOR first CASES', () => {
    const noRef = [ ...CASES ];
    const want = noRef.reverse();
    const testItems = [
      { debitor_first: false },
      { debitor_first: false },
    ];
    const got = testDebitorFirstValues(testItems);
    expect(got).toEqual(want);
  });

  test('returns DEBITOR first CASES on null', () => {
    const want = [ ...CASES ];
    const testItems = [
      { debitor_first: null },
      { debitor_first: null },
    ];
    const got = testDebitorFirstValues(testItems);
    expect(got).toEqual(want);
  });

  test('returns DEBITOR first CASES on true', () => {
    const want = [ ...CASES ];
    const testItems = [
      { debitor_first: true },
      { debitor_first: true },
    ];
    const got = testDebitorFirstValues(testItems);
    expect(got).toEqual(want);
  });

  test('throws on inconsistent debitor_first values', () => {
    const testItems = [
      { debitor_first: true },
      { debitor_first: false },
    ];
    expect(() => testDebitorFirstValues(testItems))
      .toThrow(INCONSISTENT_SEQUENCE_ERROR);
  });
});