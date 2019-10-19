/* eslint-disable camelcase */

const TABLE_NAME = 'rules'
const INDEXED_COLUMNS = [
  'debitor',
  'debitor_transaction_latlng',
  'creditor',
  'creditor_transaction_latlng',
  'item'
]
const INDEX_OPTIONS = { name: TABLE_NAME + '-index' }

exports.up = (pgm) => {
  pgm.createIndex(TABLE_NAME, INDEXED_COLUMNS, INDEX_OPTIONS)
}

exports.down = (pgm) => {
  pgm.dropIndex(TABLE_NAME, INDEXED_COLUMNS, INDEX_OPTIONS)
}
