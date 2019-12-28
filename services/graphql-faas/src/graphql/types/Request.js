const {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLID
} = require('graphql')

const RequestCreateType = new GraphQLObjectType({
  name: 'CreateRequests',
  description: 'fields for creating requests',
  fields: {
    id: {
      type: GraphQLID,
      description: 'id per item in transaction'
    },
    transaction_id: {
      type: GraphQLString,
      description: 'id shared by goods and services grouped in a transaction'
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
      description: 'creditor account receiving payment'
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
      description: 'ID of rule instance automatically adding transaction item'
    },
    author: {
      type: GraphQLString,
      description: 'initial author of transaction'
    },
    expiration_time: {
      type: GraphQLString,
      description: 'time incomplete transaction expires'
    }
  }
})

const RequestQueryType = new GraphQLObjectType({
  name: 'QueryRequests',
  description: 'fields for querying requests',
  fields: {
    id: {
      type: GraphQLID,
      description: 'id per item in transaction'
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
      description: 'creditor account receiving payment'
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
      description: 'ID of rule instance automatically adding transaction item'
    },
    transaction_id: {
      type: GraphQLString,
      description: 'ID shared by goods and services grouped in a transaction'
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

const RequestCreateInputType = new GraphQLInputObjectType({
  name: 'RequestCreateInputType',
  type: RequestCreateType,
  fields: {
    // transaction_id: { type: new GraphQLNonNull(GraphQLString) }, // exclude
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
    author: { type: new GraphQLNonNull(GraphQLString) },
    expiration_time: { type: GraphQLString }
  }
})

const RequestQueryInputType = new GraphQLInputObjectType({
  name: 'RequestQueryInputType',
  type: RequestQueryType,
  fields: {
    debitor: { type: new GraphQLNonNull(GraphQLString) },
    debitor_approval_time: { type: GraphQLString },
    debitor_profile_latlng: { type: GraphQLString },
    debitor_transaction_latlng: { type: GraphQLString },
    debitor_device: { type: GraphQLString },
    creditor: { type: new GraphQLNonNull(GraphQLString) },
    creditor_approval_time: { type: GraphQLString },
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

const RequestApproveInputType = new GraphQLInputObjectType({
  name: 'RequestApproveInputType',
  type: RequestQueryType,
  fields: {
    id: { type: GraphQLString },
    debitor: { type: new GraphQLNonNull(GraphQLString) },
    debitor_approval_time: { type: GraphQLString },
    debitor_profile_latlng: { type: GraphQLString },
    debitor_transaction_latlng: { type: GraphQLString },
    debitor_device: { type: GraphQLString },
    creditor: { type: new GraphQLNonNull(GraphQLString) },
    creditor_approval_time: { type: GraphQLString },
    creditor_profile_latlng: { type: GraphQLString },
    creditor_transaction_latlng: { type: GraphQLString },
    creditor_device: { type: GraphQLString },
    name: { type: new GraphQLNonNull(GraphQLString) },
    price: { type: new GraphQLNonNull(GraphQLString) },
    quantity: { type: new GraphQLNonNull(GraphQLString) },
    unit_of_measurement: { type: GraphQLString },
    units_measured: { type: GraphQLString },
    rule_instance_id: { type: GraphQLString },
    transaction_id: { type: new GraphQLNonNull(GraphQLString) }, // required
    author: { type: new GraphQLNonNull(GraphQLString) },
    expiration_time: { type: GraphQLString },
    creditor_rejection_time: { type: GraphQLString },
    debitor_rejection_time: { type: GraphQLString }
  }
})

module.exports = {
  RequestCreateType,
  RequestQueryType,
  RequestCreateInputType,
  RequestQueryInputType,
  RequestApproveInputType
}
