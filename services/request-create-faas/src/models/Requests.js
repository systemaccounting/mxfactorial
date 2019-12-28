module.exports = (sequelize, type, requesterAccount) =>
  sequelize.define(
    'transaction',
    {
      id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: type.STRING,
      price: type.STRING,
      quantity: type.STRING,
      author: type.STRING,
      creditor: type.STRING,
      debitor: type.STRING,
      debitor_approval_time: type.DATE,
      creditor_approval_time: type.DATE,
      transaction_id: type.STRING,
      rule_instance_id: type.STRING
    },
    {
      // There are no `createdAt` and `updatedAt` transaction columns yet
      timestamps: false,
      hooks: {
        beforeCreate: (instance, options) => {
          if (requesterAccount === instance.creditor) {
            instance.set('creditor_approval_time', new Date())
          }
          if (requesterAccount === instance.debitor) {
            instance.set('debitor_approval_time', new Date())
          }
        }
      }
    }
  )
