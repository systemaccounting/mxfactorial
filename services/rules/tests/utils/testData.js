const getTransactionItem = require('../../src/model/transactionItem');
const createTransaction = require('../../src/model/transaction');
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

const testEmptyTransaction = createTransaction(
  "",
  "",
  null,
  null,
  null,
  null,
  null,
  "0.000",
  [],
);

const testIntraTransaction = {
  "auth_account": null,
  "transaction": testEmptyTransaction,
};

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
      "2",
      "3",
      "milk",
      2.000,
      1,
      null,
      "",
      "",
      "",
      debitor,
      creditor,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ],
    [
      "1",
      "1",
      "bread",
      3.000,
      2,
      null,
      "",
      "",
      "",
      debitor,
      creditor,
      "",
      "",
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
    "0",
    "1",
    "2",
    "3",
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
    id: "0",
    transaction_id: "123",
    item_id: 'milk',
    price: 2,
    quantity: 1,
    debitor_first: null,
    rule_instance_id: '',
    unit_of_measurement: '',
    units_measured: 0,
    debitor: 'JohnSmith',
    creditor: 'GroceryCo',
    debitor_profile_id: "",
    creditor_profile_id: "",
    debitor_approval_time: '',
    creditor_approval_time: null,
    debitor_expiration_time: '',
    creditor_expiration_time: '',
    debitor_rejection_time: '',
    creditor_rejection_time: ''
  },
  {
    id: "1",
    transaction_id: "123",
    item_id: 'bread',
    price: 3,
    quantity: 2,
    debitor_first: null,
    rule_instance_id: '',
    unit_of_measurement: '',
    units_measured: 0,
    debitor: 'JohnSmith',
    creditor: 'GroceryCo',
    debitor_profile_id: "",
    creditor_profile_id: "",
    debitor_approval_time: '',
    creditor_approval_time: null,
    debitor_expiration_time: '',
    creditor_expiration_time: '',
    debitor_rejection_time: '',
    creditor_rejection_time: ''
  }
]


module.exports = {
  fakerAccountWithSevenRandomDigits,
  testIntraTransaction,
  createItemRequestData,
  createTestApprover,
  testItems,
}