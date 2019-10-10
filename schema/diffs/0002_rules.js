// default case: DataTypes.STRING => DataTypes.STRING(255)
module.exports = {
  up: (query, DataTypes) => {
    return query.createTable('rules',
        {
          id: {
              type: DataTypes.BIGINT,
              allowNull: false,
              primaryKey: true,
              autoIncrement: true
          },
          debitor: {
              type: DataTypes.STRING
          },
          debitor_transaction_latlng: {
              type: DataTypes.STRING
          },
          creditor: {
              type: DataTypes.STRING
          },
          creditor_transaction_latlng: {
              type: DataTypes.STRING
          },
          item: {
              type: DataTypes.STRING
          },
          price: {
              type: DataTypes.STRING
          },
          quantity: {
              type: DataTypes.STRING
          },
          rule: {
              type: DataTypes.STRING
          },
      })
  },

   down: (query, DataTypes) => {
      // return query.dropAllTables()
      return query.dropTable('rules')
  }
}