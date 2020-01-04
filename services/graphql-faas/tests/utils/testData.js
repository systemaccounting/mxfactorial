const fakerAccountWithSevenRandomDigits = () => {
  const num = Math.floor(Math.random() * (9999999 - 1000000)) + 1000000
  return 'Faker' + num.toString()
}

// set test values in modules to avoid failure from
// teardown of shared values in unfinished parallel tests

// https://nodejs.org/en/knowledge/javascript-conventions/what-is-the-arguments-object/#arguments-object-in-arrow-function
function createRequestData (debitor, creditor, debitOrCredit) {

  if (arguments.length !== 3) {
    throw Error('debitor, credtior and request type required')
  }
  if (debitOrCredit !== 'credit' && debitOrCredit !== 'debit') {
    throw Error('trailing debit or credit arg required')
  }

  const author = (debitOrCredit === 'debit') ? creditor : debitor
  return [
    {
      name: 'Milk',
      price: '3',
      quantity: '2',
      author,
      debitor,
      creditor
    },
    {
      name: '9% state sales tax',
      price: '0.540',
      quantity: '1',
      author,
      debitor,
      creditor: 'StateOfCalifornia',
      rule_instance_id: "8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d"
    }
  ]
}

// const itemsUnderTestArray = [ debitRequest[0] ] // exclude tax

if(!process.env.NINE_PERCENT_CA_SALES_TAX) {
  console.error('make get-secrets ENV=dev to retrieve NINE_PERCENT_CA_SALES_TAX env var. exiting')
  process.exit(1)
}

const testRuleBuff = Buffer.from(
  process.env.NINE_PERCENT_CA_SALES_TAX,
  'base64'
)
const testRule = testRuleBuff.toString('ascii')

const testRuleInstances = [
  {
    rule: testRule,
    key_schema: 'name:',
    rule_instance_id: '8f93fd20-e60b-11e9-a7a9-2b4645cb9b8d'
  }
]

module.exports = {
  fakerAccountWithSevenRandomDigits,
  // itemsUnderTestArray,
  createRequestData,
  testRuleInstances,
}