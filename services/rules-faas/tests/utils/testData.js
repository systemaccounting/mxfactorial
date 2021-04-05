const getTransactionItem = require('../../src/model/transactionItem');
const getApprover = require('../../src/model/approver');
const {
  DEBITOR,
  CREDITOR
} = require('../../src/constants');

const fakerAccountWithSevenRandomDigits = () => {
  const num = Math.floor(Math.random() * (9999999 - 1000000)) + 1000000
  return 'Faker' + num.toString()
}

// set test values in modules to avoid failure from
// teardown of shared values in unfinished parallel tests

// createItemRequestData use:
// const testItems = createItemRequestData(
//   'JohnSmith',
//   'GroceryCo',
//   CREDITOR,
// );

// https://nodejs.org/en/knowledge/javascript-conventions/what-is-the-arguments-object/#arguments-object-in-arrow-function
function createItemRequestData (debitor, creditor, debitOrCredit) {

  if (arguments.length !== 3) {
    throw Error('debitor, credtior and request type required')
  };
  if (debitOrCredit !== CREDITOR && debitOrCredit !== DEBITOR) {
    throw Error('trailing debit or credit arg required')
  };

  const testItemData = [
    [
      2,
      3,
      "milk",
      2.000,
      1,
      null,
      "",
      "",
      "",
      debitor,
      creditor,
      0,
      0,
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    [
      1,
      1,
      "bread",
      3.000,
      2,
      null,
      "",
      "",
      "",
      debitor,
      creditor,
      0,
      0,
      "",
      "",
      "",
      "",
      "",
      "",
    ],
  ];

  let items = [];

  for (t of testItemData) {
    let i = getTransactionItem(...t);
    items.push(i);
  };

  return items;
}

function createTestApprover (approverName, debitOrCredit) {

  if (arguments.length !== 2) {
    throw Error('debitor, credtior and request type required')
  };
  if (debitOrCredit !== CREDITOR && debitOrCredit !== DEBITOR) {
    throw Error('trailing debit or credit arg required')
  };

  const testApproverData = [
    0,
    1,
    2,
    3,
    approverName,
    debitOrCredit,
    null,
    null,
    null,
    null,
    null
  ];

  return getApprover(...testApproverData);
}

const testItems = [
  {
    id: 0,
    transaction_id: 123,
    item_id: 'milk',
    price: 2,
    quantity: 1,
    debitor_first: null,
    rule_instance_id: '',
    unit_of_measurement: '',
    units_measurement: '',
    debitor: 'JohnSmith',
    creditor: 'GroceryCo',
    debitor_profile_id: 0,
    creditor_profile_id: 0,
    debitor_approval_time: '',
    creditor_approval_time: null,
    debitor_expiration_time: '',
    creditor_expiration_time: '',
    debitor_rejection_time: '',
    creditor_rejection_time: ''
  },
  {
    id: 1,
    transaction_id: 123,
    item_id: 'bread',
    price: 3,
    quantity: 2,
    debitor_first: null,
    rule_instance_id: '',
    unit_of_measurement: '',
    units_measurement: '',
    debitor: 'JohnSmith',
    creditor: 'GroceryCo',
    debitor_profile_id: 0,
    creditor_profile_id: 0,
    debitor_approval_time: '',
    creditor_approval_time: null,
    debitor_expiration_time: '',
    creditor_expiration_time: '',
    debitor_rejection_time: '',
    creditor_rejection_time: ''
  }
]

const testApprovedItems = [
  {
    id: null,
    transaction_id: null,
    item_id: '9% state sales tax',
    price: 0.18,
    quantity: 1,
    debitor_first: null,
    rule_instance_id: 1,
    unit_of_measurement: '',
    units_measurement: '',
    debitor: 'GroceryCo',
    creditor: 'StateOfCalifornia',
    debitor_profile_id: 0,
    creditor_profile_id: 0,
    debitor_approval_time: 'CURRENT_TIMESTAMP',
    creditor_approval_time: 'CURRENT_TIMESTAMP',
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
  },
  {
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
    debitor_approval_time: 'CURRENT_TIMESTAMP',
    creditor_approval_time: 'CURRENT_TIMESTAMP',
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
  },
  {
    id: 0,
    transaction_id: 123,
    item_id: 'milk',
    price: 2,
    quantity: 1,
    debitor_first: null,
    rule_instance_id: '',
    unit_of_measurement: '',
    units_measurement: '',
    debitor: 'JohnSmith',
    creditor: 'GroceryCo',
    debitor_profile_id: 0,
    creditor_profile_id: 0,
    debitor_approval_time: '',
    creditor_approval_time: 'CURRENT_TIMESTAMP',
    debitor_expiration_time: '',
    creditor_expiration_time: '',
    debitor_rejection_time: '',
    creditor_rejection_time: '',
    approvers: [
      {
        id: null,
        rule_instance_id: null,
        transaction_id: null,
        transaction_item_id: null,
        account_name: 'JohnSmith',
        account_role: 'debitor',
        device_id: null,
        device_latlng: null,
        approval_time: null,
        rejection_time: null,
        expiration_time: null
      },
      {
        id: null,
        rule_instance_id: 8,
        transaction_id: 123,
        transaction_item_id: 0,
        account_name: 'IgorPetrov',
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
        transaction_id: 123,
        transaction_item_id: 0,
        account_name: 'MiriamLevy',
        account_role: 'creditor',
        device_id: null,
        device_latlng: null,
        approval_time: 'CURRENT_TIMESTAMP',
        rejection_time: null,
        expiration_time: null
      }
    ]
  },
  {
    id: 1,
    transaction_id: 123,
    item_id: 'bread',
    price: 3,
    quantity: 2,
    debitor_first: null,
    rule_instance_id: '',
    unit_of_measurement: '',
    units_measurement: '',
    debitor: 'JohnSmith',
    creditor: 'GroceryCo',
    debitor_profile_id: 0,
    creditor_profile_id: 0,
    debitor_approval_time: '',
    creditor_approval_time: 'CURRENT_TIMESTAMP',
    debitor_expiration_time: '',
    creditor_expiration_time: '',
    debitor_rejection_time: '',
    creditor_rejection_time: '',
    approvers: [
      {
        id: null,
        rule_instance_id: null,
        transaction_id: null,
        transaction_item_id: null,
        account_name: 'JohnSmith',
        account_role: 'debitor',
        device_id: null,
        device_latlng: null,
        approval_time: null,
        rejection_time: null,
        expiration_time: null
      },
      {
        id: null,
        rule_instance_id: 8,
        transaction_id: 123,
        transaction_item_id: 1,
        account_name: 'IgorPetrov',
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
        transaction_id: 123,
        transaction_item_id: 1,
        account_name: 'MiriamLevy',
        account_role: 'creditor',
        device_id: null,
        device_latlng: null,
        approval_time: 'CURRENT_TIMESTAMP',
        rejection_time: null,
        expiration_time: null
      }
    ]
  }
]

module.exports = {
  fakerAccountWithSevenRandomDigits,
  createItemRequestData,
  createTestApprover,
  testItems,
  testApprovedItems,
}