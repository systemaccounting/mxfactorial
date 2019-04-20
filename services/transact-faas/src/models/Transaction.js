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
      debitor_approval_time: {
        type: type.DATE,
        defaultValue: type.NOW
      },
      creditor_approval_time: {
        type: type.DATE,
        defaultValue: type.NOW
      }
    },
    {
      // There are no `createdAt` and `updatedAt` transaction columns yet
      timestamps: false
    }
  )
