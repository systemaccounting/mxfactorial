/* eslint-disable camelcase */

const TABLE_NAME = 'transactions'

exports.up = (pgm) => {
  pgm.createTable(TABLE_NAME, {
    id: 'id',
    name: { type: 'varchar(255)', notNull: true },
    price: { type: 'varchar(255)', notNull: true },
    quantity: { type: 'varchar(255)', notNull: true },
    unit_of_measurement: { type: 'varchar(255)', notNull: false },
    units_measured: { type: 'varchar(255)', notNull: false },
    rule_instance_id: { type: 'varchar(255)', notNull: false },
    transaction_id: { type: 'varchar(255)', notNull: true },
    author: { type: 'varchar(255)', notNull: true },
    expiration_time: { type: 'varchar(255)', notNull: false },
    debitor: { type: 'varchar(255)', notNull: true },
    creditor: { type: 'varchar(255)', notNull: true },
    debitor_profile_latlng: { type: 'varchar(255)', notNull: false },
    creditor_profile_latlng: { type: 'varchar(255)', notNull: false },
    debitor_transaction_latlng: { type: 'varchar(255)', notNull: false },
    creditor_transaction_latlng: { type: 'varchar(255)', notNull: false },
    debitor_approval_time: { type: 'varchar(255)', notNull: false },
    creditor_approval_time: { type: 'varchar(255)', notNull: false },
    debitor_device: { type: 'varchar(255)', notNull: false },
    creditor_device: { type: 'varchar(255)', notNull: false },
    debit_approver: { type: 'varchar(255)', notNull: false },
    credit_approver: { type: 'varchar(255)', notNull: false },
    creditor_rejection_time: { type: 'varchar(255)', notNull: false },
    debitor_rejection_time: { type: 'varchar(255)', notNull: false },
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
