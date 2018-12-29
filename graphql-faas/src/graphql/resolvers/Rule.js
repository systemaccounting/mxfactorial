const TAX_TRANSACTION_NAME = '9% state sales tax'

const GetRuleTransactionsResolver = args => {
  // Remove any existing “9% state sales tax” item to avoid duplicating objects in the array
  const accountItems = args.transactions.filter(item => {
    return item.name !== TAX_TRANSACTION_NAME
  })

  // Add 9% sales tax.
  let salesTaxValue = 0
  accountItems.forEach(item => {
    const { quantity = 1, price = 0 } = item
    salesTaxValue += price * quantity * 0.09
  })

  if (salesTaxValue > 0) {
    accountItems.push({
      uuid: 'someUUID',
      name: TAX_TRANSACTION_NAME,
      price: salesTaxValue.toFixed(3),
      quantity: 1,
      creditor: 'StateOfCalifornia'
    })
  }

  return accountItems
}

module.exports = {
  GetRuleTransactionsResolver
}
