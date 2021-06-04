const constants = require('./constants');

describe('constants', () => {
  test('exports inventory of constants', () => {
    const want = [
      'DEBITOR',
      'CREDITOR',
      'CASES',
      'ACCOUNT_ROLE_ERROR_MSG',
      'NO_MATCHING_ROLE_ERROR_MSG',
      'CURRENT_TIMESTAMP',
      'TRANSACTION_ITEM',
      'APPROVAL',
      'APPROVALS',
      'ACCOUNT_NAME',
      'APPROVAL_TIME_SUFFIX',
      'RELATIVE_RULES_PATH',
      'ACCOUNT_PROFILE_SQL',
      'ACCOUNT_ROLE_TRS_SQL',
      'STATE_NAME_TRS_SQL',
      'APPROVAL_SQL',
      'DEBITOR_FIRST',
      'INCONSISTENT_SEQUENCE_ERROR',
      'ARG_COUNT_ERROR',
      'APPROVAL_COUNT_ERROR',
      'RULES_NOT_FOUND_ERROR',
      'ID',
      'RULE_NAME',
      'ACCOUNT_ROLE',
      'VARIABLE_VALUES',
    ];
    const got = Object.keys(constants);
    expect(got).toEqual(want);
    expect(got.length).toBe(want.length);
  });
});
