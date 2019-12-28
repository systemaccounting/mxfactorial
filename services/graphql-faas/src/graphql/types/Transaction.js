const {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLID
} = require('graphql')

const TransactionType = new GraphQLObjectType({
  name: 'Transaction',
  description: 'fields on transactions',
  fields: {
    id: {
      type: GraphQLID,
      description: 'transaction item id'
    },
    debitor: {
      type: GraphQLString,
      description: 'debitor account sending payment'
    },
    debitor_profile_latlng: {
      type: GraphQLString,
      description: 'lat long of debitor account profile'
    },
    debitor_transaction_latlng: {
      type: GraphQLString,
      description: 'lat long of debitor transaction'
    },
    debitor_approval_time: {
      type: GraphQLString,
      description: 'time debitor approved transaction'
    },
    debitor_device: {
      type: GraphQLString,
      description: 'device used by debitor for transaction'
    },
    creditor: {
      type: GraphQLString,
      description: 'creditor account; receiving payment'
    },
    creditor_profile_latlng: {
      type: GraphQLString,
      description: 'lat long of creditor account profile'
    },
    creditor_transaction_latlng: {
      type: GraphQLString,
      description: 'lat long of creditor transaction'
    },
    creditor_approval_time: {
      type: GraphQLString,
      description: 'time creditor approved transaction'
    },
    creditor_device: {
      type: GraphQLString,
      description: 'device used by creditor for transaction'
    },
    name: {
      type: GraphQLString,
      description: 'name of good or service'
    },
    price: {
      type: GraphQLString,
      description: 'value of good or service'
    },
    quantity: {
      type: GraphQLString,
      description: 'quantity of good or service'
    },
    unit_of_measurement: {
      type: GraphQLString,
      description: 'unit of measurement of good or service'
    },
    units_measured: {
      type: GraphQLString,
      description: 'units measured of good or service'
    },
    rule_instance_id: {
      type: GraphQLString,
      description: 'id of rule instance automatically adding transaction item'
    },
    transaction_id: {
      type: GraphQLString,
      description: 'id shared by goods and services grouped in a transaction'
    },
    author: {
      type: GraphQLString,
      description: 'initial author of transaction'
    },
    expiration_time: {
      type: GraphQLString,
      description: 'time incomplete transaction expires'
    },
    creditor_rejection_time: {
      type: GraphQLString,
      description: 'time transaction rejected by creditor'
    },
    debitor_rejection_time: {
      type: GraphQLString,
      description: 'time transaction rejected by debitor'
    }
  }
})

const TransactionInputType = new GraphQLInputObjectType({
  name: 'TransactionInputType',
  type: TransactionType,
  fields: {
    id: { type: GraphQLID },
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
    transaction_id: { type: GraphQLString },
    author: { type: new GraphQLNonNull(GraphQLString) },
    expiration_time: { type: GraphQLString },
    creditor_rejection_time: { type: GraphQLString },
    debitor_rejection_time: { type: GraphQLString }
  }
})

module.exports = {
  TransactionType,
  TransactionInputType,
}
