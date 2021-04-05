const {
  CURRENT_TIMESTAMP,
  CASES,
  APPROVAL_TIME_SUFFIX,
  DEBITOR,
  CREDITOR,
  APPROVERS,
  APPROVER_COUNT_ERROR
} = require('./constants');
const labelApprovedItems = require('./labelApprovedItems');
const { testItems } = require('../tests/utils/testData');

describe('labelApprovedItems', () => {
  test('returns item labeled as approved', () => {
    const want = Object.assign({}, input);
    want[DEBITOR + '_' + APPROVAL_TIME_SUFFIX] = CURRENT_TIMESTAMP
    want[CREDITOR + '_' + APPROVAL_TIME_SUFFIX] = CURRENT_TIMESTAMP
    const got = labelApprovedItems([input], CASES);
    expect(got).toEqual([want]);
  });

  test('throws on omitted approvers', () => {
    const throwInput = Object.assign({}, input);
    throwInput[APPROVERS] = []
    expect(() => labelApprovedItems([throwInput], CASES)).toThrow(APPROVER_COUNT_ERROR);
  });

  test('timestamps NOT added', () => {
    const want = Object.assign({}, input);
    want[DEBITOR + '_' + APPROVAL_TIME_SUFFIX] = null
    want[CREDITOR + '_' + APPROVAL_TIME_SUFFIX] = null

    const notApproved = Object.assign({}, input);
    notApproved[DEBITOR + '_' + APPROVAL_TIME_SUFFIX] = null;
    notApproved[CREDITOR + '_' + APPROVAL_TIME_SUFFIX] = null;
    for (const appr of notApproved[APPROVERS]) {
      appr.approval_time = null;
    };

    const got = labelApprovedItems([notApproved], CASES);
    expect(got).toEqual([want]);
  });
});

// todo: create from function
const input = {
  id: null,
  transaction_id: null,
  item_id: '9% state sales tax',
  price: 0.54,
  quantity: 1,
  debitor_first: null,
  rule_instance_id: 1,
  unit_of_measurement: '',
  units_measurement: '',
  debitor: 'GroceryCo',
  creditor: 'StateOfCalifornia',
  debitor_profile_id: 0,
  creditor_profile_id: 0,
  debitor_approval_time: null,
  creditor_approval_time: null,
  debitor_expiration_time: '',
  creditor_expiration_time: '',
  debitor_rejection_time: '',
  creditor_rejection_time: '',
  approvers: [
    {
      id: null,
      rule_instance_id: 2,
      transaction_id: null,
      transaction_item_id: null,
      account_name: 'IgorPetrov',
      account_role: 'debitor',
      device_id: null,
      device_latlng: null,
      approval_time: 'CURRENT_TIMESTAMP',
      rejection_time: null,
      expiration_time: null
    },
    {
      id: null,
      rule_instance_id: 3,
      transaction_id: null,
      transaction_item_id: null,
      account_name: 'MiriamLevy',
      account_role: 'debitor',
      device_id: null,
      device_latlng: null,
      approval_time: 'CURRENT_TIMESTAMP',
      rejection_time: null,
      expiration_time: null
    },
    {
      id: null,
      rule_instance_id: 4,
      transaction_id: null,
      transaction_item_id: null,
      account_name: 'BenRoss',
      account_role: 'creditor',
      device_id: null,
      device_latlng: null,
      approval_time: 'CURRENT_TIMESTAMP',
      rejection_time: null,
      expiration_time: null
    },
    {
      id: null,
      rule_instance_id: 5,
      transaction_id: null,
      transaction_item_id: null,
      account_name: 'JacobWebb',
      account_role: 'creditor',
      device_id: null,
      device_latlng: null,
      approval_time: 'CURRENT_TIMESTAMP',
      rejection_time: null,
      expiration_time: null
    },
    {
      id: null,
      rule_instance_id: 7,
      transaction_id: null,
      transaction_item_id: null,
      account_name: 'MiriamLevy',
      account_role: 'creditor',
      device_id: null,
      device_latlng: null,
      approval_time: 'CURRENT_TIMESTAMP',
      rejection_time: null,
      expiration_time: null
    }
  ]
};