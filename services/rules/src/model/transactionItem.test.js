const transactionItem = require('./transactionItem');

describe('transactionItem', () => {
  test('returns a transactionItem with keys & values', () => {
    const wantKeys = [
      'id',
      'transaction_id',
      'item_id',
      'price',
      'quantity',
      'debitor_first',
      'rule_instance_id',
      'unit_of_measurement',
      'units_measured',
      'debitor',
      'creditor',
      'debitor_profile_id',
      'creditor_profile_id',
      'debitor_approval_time',
      'creditor_approval_time',
      'debitor_expiration_time',
      'creditor_expiration_time',
      'debitor_rejection_time',
      'creditor_rejection_time',
    ];
    const wantVals = [
      'idtest',
      'transactionIdtest',
      'itemIdtest',
      'pricetest',
      'quantitytest',
      'debitorFirsttest',
      'ruleInstanceIdtest',
      'unitOfMeasurementtest',
      'unitsMeasuredtest',
      'debitortest',
      'creditortest',
      'debitorProfileIdtest',
      'creditorProfileIdtest',
      'debitorApprovalTimetest',
      'creditorApprovalTimetest',
      'debitorExpirationTimetest',
      'creditorExpirationTimetest',
      'debitorRejectionTimetest',
      'creditorRejectionTimetest',
    ];
    const got = transactionItem(...wantVals);
    expect(Object.keys(got)).toEqual(wantKeys);
    expect(Object.values(got)).toEqual(wantVals);
  });
});