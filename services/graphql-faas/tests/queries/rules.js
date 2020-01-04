const fetchRules = `
  query fetchRules($items: [TransactionInput]!) {
    rules(transactions: $items) {
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

const fetchRuleInstances = `
  query fetchRuleInstances($input: [String]) {
    ruleInstances(keySchema: $input) {
      key_schema
      rule_instance_id
      description
      rule
    }
  }
`

module.exports = {
  fetchRules,
  fetchRuleInstances
}
