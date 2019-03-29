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
      creditor: type.STRING
    },
    {
      // There are no `createdAt` and `updatedAt` transaction columns yet
      timestamps: false
    }
  )
