const fetchRules = `
  query rules($input: [TransactionInputType]!) {
    rules(transactions: $input) {
        name
        price
        quantity
        author
        debitor
        creditor
        rule_instance_id
    }
  }
`

module.exports = { fetchRules }
