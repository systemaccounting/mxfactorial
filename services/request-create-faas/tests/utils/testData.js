const fakerAccountWithSevenRandomDigits = () => {
  const num = Math.floor(Math.random() * (9999999 - 1000000)) + 1000000
  return 'Faker' + num.toString()
}

const TEST_ACCOUNTS = [
  fakerAccountWithSevenRandomDigits(),
  fakerAccountWithSevenRandomDigits()
]

const itemsUnderTestArray = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2',
    author: TEST_ACCOUNTS[1],
    debitor: TEST_ACCOUNTS[0],
    creditor: TEST_ACCOUNTS[1],
    // transaction_id: '662bc1a0-ed24-11e9-90ac-fd8810fc35b7'
  }
]

const itemsStandardArray = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2',
    author: TEST_ACCOUNTS[1],
    debitor: TEST_ACCOUNTS[0],
    creditor: TEST_ACCOUNTS[1]
  },
  {
    name: '9% state sales tax',
    quantity: 1,
    price: '0.540',
    author: TEST_ACCOUNTS[1],
    debitor: TEST_ACCOUNTS[0],
    creditor: 'StateOfCalifornia',
    rule_instance_id: "8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d"
  }
]

const testedItemsIntendedForStorage = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2',
    author: TEST_ACCOUNTS[1],
    debitor: TEST_ACCOUNTS[0],
    creditor: TEST_ACCOUNTS[1],
    transaction_id: '662bc1a0-ed24-11e9-90ac-fd8810fc35b7'
  }
]

const testRule = `let TAX_TRANSACTION_NAME = '9% state sales tax'; let accountItems = items.filter(item => {   return item.name !== TAX_TRANSACTION_NAME; }); let salesTaxValue = 0; accountItems.forEach(item => {   let quantity = item.quantity || 1;   let price = item.price || 0;   salesTaxValue += price * quantity * 0.09; }); if (salesTaxValue > 0) {   accountItems.push({     author: accountItems[0].author,     rule_instance_id: ruleId,     name: TAX_TRANSACTION_NAME,     price: salesTaxValue.toFixed(3),     quantity: 1,     creditor: 'StateOfCalifornia',     creditor_approval_time: new Date().toISOString(),     debitor: accountItems[0].debitor,     transaction_id: accountItems[0].transaction_id   }); }; console.log('Applied rules: ', JSON.stringify(accountItems)); return accountItems;`

const testRuleInstances = [
  {
    rule: testRule,
    key_schema: 'name:',
    rule_instance_id: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d'
  }
]

const testNotification =  {
  service: 'TRANSACT',
  message: itemsStandardArray
}

const testGraphqlRequestSender = 'testsender'

module.exports = {
  itemsUnderTestArray,
  itemsStandardArray,
  testedItemsIntendedForStorage,
  testRuleInstances,
  testNotification,
  testGraphqlRequestSender,
  TEST_ACCOUNTS
}