const util = require('util')

// default case: DataTypes.STRING => DataTypes.STRING(255)

module.exports = {
    up: (query, DataTypes) => {
        return util.promisify(
            query.createTable('transactions', {
              id: {
                  type: DataTypes.BIGINT,
                  allowNull: false,
                  primaryKey: true,
                  autoIncrement: true
              },
              name: {
                  type: DataTypes.STRING
              },
              price: {
                  type: DataTypes.STRING
              },
              quantity: {
                  type: DataTypes.STRING
              },
              unit_of_measurement: {
                  type: DataTypes.STRING
              },
              units_measured: {
                  type: DataTypes.STRING
              },
              rule_instance_id: {
                  type: DataTypes.STRING
              },
              transaction_id: {
                  type: DataTypes.STRING
              },
              author: {
                  type: DataTypes.STRING
              },
              expiration_time: {
                  type: DataTypes.STRING
              },
              debitor: {
                  type: DataTypes.STRING
              },
              creditor: {
                  type: DataTypes.STRING
              },
              debitor_profile_latlng: {
                  type: DataTypes.STRING
              },
              creditor_profile_latlng: {
                  type: DataTypes.STRING
              },
              debitor_transaction_latlng: {
                  type: DataTypes.STRING
              },
              creditor_transaction_latlng: {
                  type: DataTypes.STRING
              },
              debitor_approval_time: {
                  type: DataTypes.STRING
              },
              creditor_approval_time: {
                  type: DataTypes.STRING
              },
              debitor_device: {
                  type: DataTypes.STRING
              },
              creditor_device: {
                  type: DataTypes.STRING
              },
              debit_approver: {
                  type: DataTypes.STRING
              },
              credit_approver: {
                  type: DataTypes.STRING
              },
              creditor_rejection_time: {
                  type: DataTypes.STRING
              },
              debitor_rejection_time: {
                  type: DataTypes.STRING
              },
          })
        )
    },

    down: (query, DataTypes) => {
        // return query.dropAllTables()
        return util.promisify(
          query.dropTable('transactions')
        )
    }
}