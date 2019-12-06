/* eslint-disable camelcase */

const TABLE_NAME = 'notification_websockets'

exports.up = pgm => {
  pgm.createTable(TABLE_NAME, {
    id: 'id',
    connection_id: { type: 'varchar(25)', notNull: true },
    created_at: { type: 'timestamp', notNull: true },
    epoch_created_at: { type: 'bigint', notNull: true },
    account: { type: 'varchar(64)' }
  })

  pgm.createTrigger(TABLE_NAME, 'convert_epoch_timestamp', {
    when: 'BEFORE',
    operation: 'INSERT',
    level: 'ROW',
    language: 'plpgsql',
    replace: true
  },
  `
  BEGIN
    NEW.created_at = to_timestamp(NEW.epoch_created_at/1000);
    RETURN NEW;
  END;`
  )
}

exports.down = pgm => {
  pgm.dropTable(TABLE_NAME, {
    ifExists: true,
    cascade: true
  })
}
