const approval = require('./approval');

describe('approval', () => {
  test('returns an approval with keys & values', () => {
    const wantKeys = [
      'id',
      'rule_instance_id',
      'transaction_id',
      'transaction_item_id',
      'account_name',
      'account_role',
      'device_id',
      'device_latlng',
      'approval_time',
      'rejection_time',
      'expiration_time',
    ];
    const wantVals = [
      'idtest',
      'ruleInstanceIdtest',
      'transactionIdtest',
      'transactionItemIdtest',
      'accountNametest',
      'accountRoletest',
      'deviceIdtest',
      'deviceLatLngtest',
      'approvalTimetest',
      'rejectionTimetest',
      'expirationTimetest',
    ];
    const got = approval(...wantVals);
    expect(Object.keys(got)).toEqual(wantKeys);
    expect(Object.values(got)).toEqual(wantVals);
  });
});