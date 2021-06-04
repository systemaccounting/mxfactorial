const approveItemOnAccount = require('./approveItemOnAccount');
const {
  CURRENT_TIMESTAMP,
  CREDITOR
} = require('../constants');

const {
  createItemRequestData,
  createTestApproval,
} = require('../../tests/utils/testData');

describe('approveItemOnAccount', () => {
  test('returns approval with creditor timestamp', () => {

    const testdebitor = 'JohnSmith';
    const testcreditor = 'GroceryCo';
    const testapprovername = 'MiriamLevy';

    const want = {
      id: "0",
      rule_instance_id: "1",
      transaction_id: "3",
      transaction_item_id: "2",
      account_name: testapprovername,
      account_role: CREDITOR,
      device_id: null,
      device_latlng: null,
      approval_time: CURRENT_TIMESTAMP,
      rejection_time: null,
      expiration_time: null,
    };

    const singleTestItem = createItemRequestData(
      testdebitor,
      testcreditor,
      CREDITOR,
    )[0];

    const testApprover = createTestApproval(
      testapprovername,
      CREDITOR,
    );

    const got = approveItemOnAccount(
      "1",
      null, // ruleInstanceName not used
      null, // ruleInstanceRole not used
      testapprovername,
      singleTestItem,
      testApprover,
      testdebitor,
      testcreditor,
      CREDITOR,
      testapprovername,
    );
    expect(got).toEqual(want);
  });

  test('inconsistent accounts returns approver without timestamp', () => {

    const testdebitor = 'JohnSmith';
    const testcreditor = 'GroceryCo';
    const testapprovername = 'MiriamLevy';

    const want = {
      id: "0",
      rule_instance_id: "1",
      transaction_id: "2",
      transaction_item_id: "3",
      account_name: testapprovername,
      account_role: CREDITOR,
      device_id: null,
      device_latlng: null,
      approval_time: null,
      rejection_time: null,
      expiration_time: null,
    };

    const singleTestItem = createItemRequestData(
      testdebitor,
      'other',
      CREDITOR,
    )[0];

    const testApprover = createTestApproval(
      testapprovername,
      CREDITOR,
    );

    const got = approveItemOnAccount(
      "1",
      null, // ruleInstanceName not used
      null, // ruleInstanceRole not used
      testapprovername,
      singleTestItem,
      testApprover,
      testdebitor,
      testcreditor,
      CREDITOR,
      testapprovername,
    );
    expect(got).toEqual(want);
  });
});