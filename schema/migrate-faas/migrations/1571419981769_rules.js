/* eslint-disable camelcase */

const TABLE_NAME = 'rules'

exports.up = (pgm) => {
  pgm.createTable(TABLE_NAME, {
    id: 'id',
    debitor: { type: 'varchar(255)', notNull: true },
    debitor_transaction_latlng: { type: 'varchar(255)', notNull: true },
    creditor: { type: 'varchar(255)', notNull: true },
    creditor_transaction_latlng: { type: 'varchar(255)', notNull: true },
    item: { type: 'varchar(255)', notNull: true },
    price: { type: 'varchar(255)', notNull: true },
    quantity: { type: 'varchar(255)', notNull: true },
    rule: { type: 'text', notNull: true },
    createdAt: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp')
    }
  })
}

exports.down = (pgm) => {
  pgm.dropTable(TABLE_NAME, {
    ifExists: true,
    cascade: true
  })
}
