// default case: DataTypes.STRING => DataTypes.STRING(255)
// forced to separate rules index from table creation to avoid failure
module.exports = {
  up: (query, DataTypes) => {
    return query.addIndex('rules', ['debitor'], {
      indexName: 'debitor'
    })
      .then(() => query.addIndex('rules', ['debitor_transaction_latlng'], {
        indexName: 'debitor_transaction_latlng'
      }))
      .then(() => query.addIndex('rules', ['creditor'], {
        indexName: 'creditor'
      }))
      .then(() => query.addIndex('rules', ['creditor_transaction_latlng'], {
        indexName: 'creditor_transaction_latlng'
      }))
      .then(() => query.addIndex('rules', ['item'], {
        indexName: 'item'
      }))
  },
// removeIndex() fails after attempting default rules_rulesdebitor removal
// undoc'd solution: https://github.com/sequelize/cli/issues/332
  down: (query, DataTypes) => {
    return query.removeIndex('rules', ['debitor'], {
      indexName: 'debitor'
    })
      .then(() => query.removeIndex('rules', ['debitor_transaction_latlng'], {
        indexName: 'debitor_transaction_latlng'
      }))
      .then(() => query.removeIndex('rules', ['creditor'], {
        indexName: 'creditor'
      }))
      .then(() => query.removeIndex('rules', ['creditor_transaction_latlng'], {
        indexName: 'creditor_transaction_latlng'
      }))
      .then(() => query.removeIndex('rules', ['item'], {
        indexName: 'item'
      }))
  }
}