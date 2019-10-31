const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION })

const rulesToInitInDynamoDb = [] // push here after adding below

const ruleAsString = functionText => {
  let ruleAsArrayOfLines = functionText.split('\n')
  let noCommentsRegex = /^\/\/.*/mg
  let ruleArrayWithoutComments = ruleAsArrayOfLines.filter(line => {
    if (line.length === 0) { return } // avoid empty lines
    return !noCommentsRegex.test(line) // avoid commented lines
  })
  let ruleAsString = ruleArrayWithoutComments.join(' ')
  return ruleAsString
}

const formatDynamoDbPutItems = rulesToInit => {
  let ddbPutItems = []
  for (let i = 0; i < rulesToInit.length; i++) {
    let { key_schema, rule_instance_id, rule } = rulesToInit[i]
    ddbPutItems.push({
      PutRequest: {
        Item: {
          key_schema, rule_instance_id, rule,
          time_added_utc: new Date().toUTCString(),
          description: 'created from services/rules-faas/utils/initRules.js'
        }
      }
    })
  }
  return ddbPutItems
}

const batchWriteTable = (service, table, formattedItems) => {
  let params = {
    RequestItems: {
      [table]: formattedItems
    }
  }
  return service.batchWrite(params)
    .promise()
    .then(data => {
      console.log(data)
      if (!Object.keys(data.UnprocessedItems).length) {
        return
      } // low priority todo: else handle unprocessed items
    })
    .catch(err => {
      console.log(err, err.stack)
      throw err
    })
}


// ############ no asi available to rules ############
// ################## ADD SEMICOLONS ##################


// ################## TAX RULE ##################

const TAX_RULE_WITH_SEMICOLONS = `
let TAX_TRANSACTION_NAME = '9% state sales tax';
// Remove any existing “9% state sales tax” item to avoid duplicating objects in the array
let accountItems = transactionItems.filter(item => {
  return item.name !== TAX_TRANSACTION_NAME;
});

// Add 9% sales tax.
let salesTaxValue = 0;
accountItems.forEach(item => {
  let quantity = item.quantity || 1;
  let price = item.price || 0;
  salesTaxValue += price * quantity * 0.09;
});

if (salesTaxValue > 0) {
  accountItems.push({
    author: accountItems[0].author,
    rule_instance_id: ruleId,
    name: TAX_TRANSACTION_NAME,
    price: salesTaxValue.toFixed(3),
    quantity: 1,
    creditor: 'StateOfCalifornia',
    debitor: accountItems[0].debitor
  });
};
console.log('Applied rules: ', JSON.stringify(accountItems));

return accountItems;
`

const taxRuleItem = {
  key_schema: 'name:',
  rule_instance_id: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d',
  rule: ruleAsString(TAX_RULE_WITH_SEMICOLONS)
}

rulesToInitInDynamoDb.push(taxRuleItem)

// ################## add in dynamodb ##################

const formattedItems = formatDynamoDbPutItems(rulesToInitInDynamoDb)

;(async () => {
  await batchWriteTable(
    ddb,
    process.env.RULE_INSTANCE_TABLE_NAME,
    formattedItems
  )
})();