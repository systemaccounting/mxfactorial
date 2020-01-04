// https://www.apollographql.com/docs/graphql-tools/generate-schema/
module.exports = `
  type Transaction {

    "id of transaction item"
    id: ID!

    "transaction request author"
    author: String!

    "debitor account sending payment"
    debitor: String!

    "lat long of debitor account profile"
    debitor_profile_latlng: String

    "lat long of debitor transaction"
    debitor_transaction_latlng: String

    "time debitor approved transaction"
    debitor_approval_time: String

    "device used by debitor for transaction"
    debitor_device: String

    "creditor account; receiving payment"
    creditor: String!

    "lat long of creditor account profile"
    creditor_profile_latlng: String

    "lat long of creditor transaction"
    creditor_transaction_latlng: String

    "time creditor approved transaction"
    creditor_approval_time: String

    "device used by creditor for transaction"
    creditor_device: String

    "name of good or service"
    name: String!

    "value of good or service"
    price: String!

    "quantity of good or service"
    quantity: String!

    "unit of measurement of good or service"
    unit_of_measurement: String

    "units measured of good or service"
    units_measured: String

    "id of rule instance automatically adding transaction item"
    rule_instance_id: String

    "id shared by goods and services grouped in a transaction"
    transaction_id: String

    "time incomplete transaction expires"
    expiration_time: String

    "time transaction rejected by creditor"
    creditor_rejection_time: String

    "time transaction rejected by debitor"
    debitor_rejection_time: String
  }

  input RequestCreateInput {

    "id of transaction item"
    id: ID

    "transaction request author"
    author: String!

    "debitor account sending payment"
    debitor: String!

    "lat long of debitor account profile"
    debitor_profile_latlng: String

    "lat long of debitor transaction"
    debitor_transaction_latlng: String

    "time debitor approved transaction"
    debitor_approval_time: String

    "device used by debitor for transaction"
    debitor_device: String

    "creditor account; receiving payment"
    creditor: String!

    "lat long of creditor account profile"
    creditor_profile_latlng: String

    "lat long of creditor transaction"
    creditor_transaction_latlng: String

    "time creditor approved transaction"
    creditor_approval_time: String

    "device used by creditor for transaction"
    creditor_device: String

    "name of good or service"
    name: String!

    "value of good or service"
    price: String!

    "quantity of good or service"
    quantity: String!

    "unit of measurement of good or service"
    unit_of_measurement: String

    "units measured of good or service"
    units_measured: String

    "id of rule instance automatically adding transaction item"
    rule_instance_id: String

    "time incomplete transaction expires"
    expiration_time: String
  }

  input RequestApproveInput {
    "id shared by goods and services grouped in a transaction"
    transaction_id: String!

    "id of transaction item"
    id: ID

    "transaction request author"
    author: String!

    "debitor account sending payment"
    debitor: String!

    "lat long of debitor account profile"
    debitor_profile_latlng: String

    "lat long of debitor transaction"
    debitor_transaction_latlng: String

    "time debitor approved transaction"
    debitor_approval_time: String

    "device used by debitor for transaction"
    debitor_device: String

    "creditor account; receiving payment"
    creditor: String!

    "lat long of creditor account profile"
    creditor_profile_latlng: String

    "lat long of creditor transaction"
    creditor_transaction_latlng: String

    "time creditor approved transaction"
    creditor_approval_time: String

    "device used by creditor for transaction"
    creditor_device: String

    "name of good or service"
    name: String!

    "value of good or service"
    price: String!

    "quantity of good or service"
    quantity: String!

    "unit of measurement of good or service"
    unit_of_measurement: String

    "units measured of good or service"
    units_measured: String

    "id of rule instance automatically adding transaction item"
    rule_instance_id: String

    "time incomplete transaction expires"
    expiration_time: String
  }

  input TransactionInput {
    "id shared by goods and services grouped in a transaction"
    transaction_id: String

    "id of transaction item"
    id: ID

    "transaction request author"
    author: String!

    "debitor account sending payment"
    debitor: String!

    "lat long of debitor account profile"
    debitor_profile_latlng: String

    "lat long of debitor transaction"
    debitor_transaction_latlng: String

    "time debitor approved transaction"
    debitor_approval_time: String

    "device used by debitor for transaction"
    debitor_device: String

    "creditor account; receiving payment"
    creditor: String!

    "lat long of creditor account profile"
    creditor_profile_latlng: String

    "lat long of creditor transaction"
    creditor_transaction_latlng: String

    "time creditor approved transaction"
    creditor_approval_time: String

    "device used by creditor for transaction"
    creditor_device: String

    "name of good or service"
    name: String!

    "value of good or service"
    price: String!

    "quantity of good or service"
    quantity: String!

    "unit of measurement of good or service"
    unit_of_measurement: String

    "units measured of good or service"
    units_measured: String

    "id of rule instance automatically adding transaction item"
    rule_instance_id: String

    "time incomplete transaction expires"
    expiration_time: String
  }

  type RuleInstance {
    "colon seperated list of transaction item fields affected by rule, e.g. name:price"
    key_schema: String!

    "id of rule instance record"
    rule_instance_id: String!

    "description of rule"
    description: String

    "rule contents"
    rule: String!
  }

  type Query {
    transactionsByID(transactionID: String): [Transaction]
    transactionsByAccount(account: String): [Transaction]
    requestsByID(transactionID: String): [Transaction]
    requestsByAccount(account: String): [Transaction]
    rules(transactions: [TransactionInput]): [Transaction]
    "colon seperated list of transaction item fields affected by rule, e.g. name: OR name:price"
    ruleInstances(keySchema: [String]): [RuleInstance]
  }

  type Mutation {
    createRequest(items: [RequestCreateInput]!): [Transaction]
    approveRequest(items: [RequestApproveInput]!): [Transaction]
  }
`