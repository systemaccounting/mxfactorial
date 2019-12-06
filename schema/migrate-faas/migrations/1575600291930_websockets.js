/* eslint-disable camelcase */

const TABLE_NAME = 'notification_websockets'
const FUNCTION_NAME = 'convert_epoch_timestamp'

exports.up = pgm => {
  pgm.createTable(TABLE_NAME, {
    id: 'id',
    connection_id: { type: 'varchar(25)', notNull: true },
    created_at: { type: 'timestamp', notNull: true },
    epoch_created_at: { type: 'bigint', notNull: true },
    account: { type: 'varchar(64)' }
  })
  // https://github.com/salsita/node-pg-migrate/issues/387#issuecomment-456749126
  pgm.createTrigger(TABLE_NAME, FUNCTION_NAME, {
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
  pgm.dropFunction(FUNCTION_NAME, {
    ifExists: true,
    cascade: true
  })
  pgm.dropTable(TABLE_NAME, {
    ifExists: true,
    cascade: true
  })
}
