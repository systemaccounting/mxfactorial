const rule = `
let TAX_TRANSACTION_NAME = '9% state sales tax'
// Remove any existing “9% state sales tax” item to avoid duplicating objects in the array
const accountItems = transactionItems.filter(item => {
  return item.name !== TAX_TRANSACTION_NAME
})

// Add 9% sales tax.
let salesTaxValue = 0
accountItems.forEach(item => {
  const quantity = item.quantity || 1
  const price = item.price || 0
  salesTaxValue += price * quantity * 0.09
})

if (salesTaxValue > 0) {
  accountItems.push({
    uuid: ruleID,
    author: accountItems[0].author,
    rule_instance_id: ruleID,
    name: TAX_TRANSACTION_NAME,
    price: salesTaxValue.toFixed(3),
    quantity: 1,
    creditor: 'StateOfCalifornia',
    debitor: accountItems[0].debitor
  })
}
console.log('Applied rules: ', JSON.stringify(accountItems))

return accountItems
`

const applyRules = new Function('ruleID', 'transactionItems', rule)


module.exports = applyRules
