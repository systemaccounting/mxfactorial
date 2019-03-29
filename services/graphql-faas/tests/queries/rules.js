const fetchRules = `
  query fetchRules($transactions: [TransactionItem]) {
    rules(transactions: $transactions) {
      uuid
      name
      price
      quantity
      rule_instance_id
    }
  }
`

module.exports = { fetchRules }
