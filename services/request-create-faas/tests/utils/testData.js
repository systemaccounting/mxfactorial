const itemsUnderTestArray = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2',
    author: 'Joe Smith',
    debitor: 'Joe Smith',
    creditor: 'Mary',
    // transaction_id: '662bc1a0-ed24-11e9-90ac-fd8810fc35b7'
  }
]

const itemsStandardArray = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2',
    author: 'Joe Smith',
    debitor: 'Joe Smith',
    creditor: 'Mary'
  },
  {
    name: '9% state sales tax',
    quantity: 1,
    price: '0.540',
    author: 'Joe Smith',
    debitor: 'Joe Smith',
    creditor: 'StateOfCalifornia',
    rule_instance_id: "8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d"
  }
]

const testedItemsIntendedForStorage = [
  {
    name: 'Milk',
    price: '3',
    quantity: '2',
    author: 'Joe Smith',
    debitor: 'Joe Smith',
    creditor: 'Mary',
    transaction_id: '662bc1a0-ed24-11e9-90ac-fd8810fc35b7'
  }
]

const testRule = `let TAX_TRANSACTION_NAME = '9% state sales tax'; let accountItems = items.filter(item => {   return item.name !== TAX_TRANSACTION_NAME; }); let salesTaxValue = 0; accountItems.forEach(item => {   let quantity = item.quantity || 1;   let price = item.price || 0;   salesTaxValue += price * quantity * 0.09; }); if (salesTaxValue > 0) {   accountItems.push({     author: accountItems[0].author,     rule_instance_id: ruleId,     name: TAX_TRANSACTION_NAME,     price: salesTaxValue.toFixed(3),     quantity: 1,     creditor: 'StateOfCalifornia',     debitor: accountItems[0].debitor   }); }; console.log('Applied rules: ', JSON.stringify(accountItems)); return accountItems;`

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

module.exports = {
  itemsUnderTestArray,
  itemsStandardArray,
  testedItemsIntendedForStorage,
  testRuleInstances,
  testNotification
}