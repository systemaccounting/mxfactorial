const applyRules = (
  transactionItems,
  ruleInstances,
  ruleIdParamName,
  transactionItemsParamName
  ) => {
  let transactionsWithRulesApplied
  let modifiedByRule = transactionItems // init recursion to cumulatively apply matched rules
  for (instance of ruleInstances) {
    let ruleInstance = new Function(
      ruleIdParamName,
      transactionItemsParamName,
      instance.rule
    )
    transactionsWithRulesApplied = ruleInstance(
      instance.rule_instance_id,
      modifiedByRule
    )
    modifiedByRule = transactionsWithRulesApplied
  }
  return transactionsWithRulesApplied
}

const getRules = async (
  rulesToQuery,
  queryFunc,
  service,
  tableName,
  rangeKey
  ) => {
  let rules = []
  for (ruleSchema of rulesToQuery) {
    let partialList = await queryFunc(
      service,
      tableName,
      rangeKey,
      ruleSchema
    )
    rules.push(...partialList)
  }
  return rules
}

const queryTable = (service, table, rangeKey, rangeVal) => {
  let params = {
    TableName: table,
    KeyConditionExpression: rangeKey + ' = :a',
    ExpressionAttributeValues: {
      ':a': rangeVal
    }
  }
  return service.query(params)
    .promise()
    .then(async data => {
      // console.log(data.Items)
      return data.Items
    })
    .catch(async err => {
      console.log(err, err.stack)
      throw err
    })
}

module.exports = {
  applyRules,
  getRules,
  queryTable
}