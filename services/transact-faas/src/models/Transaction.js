module.exports = (sequelize, type) =>
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
      creditor_approval_time: type.DATE
    },
    {
      // There are no `createdAt` and `updatedAt` transaction columns yet
      timestamps: false,
      hooks: {
        beforeCreate: (instance, options) => {
          if (instance.author === instance.creditor) {
            instance.set('creditor_approval_time', new Date())
          }
          if (instance.author === instance.debitor) {
            instance.set('debitor_approval_time', new Date())
          }
        }
      }
    }
  )
