module.exports = (sequelize, type) => {
  return sequelize.define('transaction', {
    id: {
      type: type.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: type.STRING,
    price: type.FLOAT,
    quantity: type.FLOAT
  })
}
