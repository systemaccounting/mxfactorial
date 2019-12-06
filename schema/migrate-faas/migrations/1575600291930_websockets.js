/* eslint-disable camelcase */

const TABLE_NAME = 'notification_websockets'

exports.up = pgm => {
  pgm.createTable(TABLE_NAME, {
    id: 'id',
    connection_id: { type: 'varchar(25)', notNull: true },
    created_at: { type: 'timestamp', notNull: true },
    account: { type: 'varchar(64)' }
  })
}

exports.down = pgm => {
  pgm.dropTable(TABLE_NAME, {
    ifExists: true,
    cascade: true
  })
}
