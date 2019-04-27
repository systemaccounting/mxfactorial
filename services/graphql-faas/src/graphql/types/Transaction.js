const {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLID
} = require('graphql')

const TransactionType = new GraphQLObjectType({
  name: 'Transaction',
  description: 'Transactions',
  fields: {
    id: {
      type: GraphQLID,
      description: 'Transaction ID'
    },
    uuid: { type: GraphQLID },
    debitor: {
      type: GraphQLString,
      description: 'Debitor account; sending payment'
    },
    debitor_profile_latlng: {
      type: GraphQLString,
      description: 'Lat long of debitor account profile'
    },
    debitor_transaction_latlng: {
      type: GraphQLString,
      description: 'Lat long of debitor transaction'
    },
    debitor_approval_time: {
      type: GraphQLString,
      description: 'Time debitor approved transaction'
    },
    debitor_device: {
      type: GraphQLString,
      description: 'Device used by debitor for transaction'
    },
    creditor: {
      type: GraphQLString,
      description: 'Creditor account; receiving payment'
    },
    creditor_profile_latlng: {
      type: GraphQLString,
      description: 'Lat long of creditor account profile'
    },
    creditor_transaction_latlng: {
      type: GraphQLString,
      description: 'Lat long of creditor transaction'
    },
    creditor_approval_time: {
      type: GraphQLString,
      description: 'Time creditor approved transaction'
    },
    creditor_device: {
      type: GraphQLString,
      description: 'Device used by creditor for transaction'
    },
    name: {
      type: GraphQLString,
      description: 'Name of good or service'
    },
    price: {
      type: GraphQLString,
      description: 'Value of good or service'
    },
    quantity: {
      type: GraphQLString,
      description: 'Quantity of good or service'
    },
    unit_of_measurement: {
      type: GraphQLString,
      description: 'Unit of measurement of good or service'
    },
    units_measured: {
      type: GraphQLString,
      description: 'Units measured of good or service'
    },
    rule_instance_id: {
      type: GraphQLString,
      description: 'ID of rule instance automatically adding transaction item'
    },
    transaction_id: {
      type: GraphQLString,
      description: 'ID shared by goods and services grouped in a transaction'
    },
    debit_approver: {
      type: GraphQLString,
      description: 'Debitor account approving transaction group'
    },
    credit_approver: {
      type: GraphQLString,
      description: 'Creditor account approving transaction group'
    },
    author: {
      type: GraphQLString,
      description: 'Initial author of transaction'
    },
    expiration_time: {
      type: GraphQLString,
      description: 'Time incomplete transaction expires'
    },
    creditor_rejection_time: {
      type: GraphQLString,
      description: 'Time transaction rejected by creditor'
    },
    debitor_rejection_time: {
      type: GraphQLString,
      description: 'Time transaction rejected by debitor'
    }
  }
})

const TransactionInputType = new GraphQLInputObjectType({
  name: 'TransactionInputType',
  type: TransactionType,
  fields: {
    uuid: { type: GraphQLID },
    debitor: { type: new GraphQLNonNull(GraphQLString) },
    debitor_profile_latlng: { type: GraphQLString },
    debitor_transaction_latlng: { type: GraphQLString },
    debitor_device: { type: GraphQLString },
    creditor: { type: new GraphQLNonNull(GraphQLString) },
    creditor_profile_latlng: { type: GraphQLString },
    creditor_transaction_latlng: { type: GraphQLString },
    creditor_device: { type: GraphQLString },
    name: { type: new GraphQLNonNull(GraphQLString) },
    price: { type: new GraphQLNonNull(GraphQLString) },
    quantity: { type: new GraphQLNonNull(GraphQLString) },
    unit_of_measurement: { type: GraphQLString },
    units_measured: { type: GraphQLString },
    rule_instance_id: { type: GraphQLString },
    // transaction_id: { type: new GraphQLNonNull(GraphQLString) },
    // debit_approver: { type: new GraphQLNonNull(GraphQLString) },
    // credit_approver: { type: new GraphQLNonNull(GraphQLString) },
    author: { type: new GraphQLNonNull(GraphQLString) },
    expiration_time: { type: GraphQLString },
    creditor_rejection_time: { type: GraphQLString },
    debitor_rejection_time: { type: GraphQLString }
  }
})

module.exports = {
  TransactionType,
  TransactionInputType
}
