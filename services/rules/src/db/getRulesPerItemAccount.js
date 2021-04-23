const {
  TRANSACTION_ITEM,
  RULE_INSTANCE_SQL,
} = require('../constants');

module.exports = async function(db, roleName, accountName) {
  const rulesPerAccount = await db.query(
    RULE_INSTANCE_SQL,
    [TRANSACTION_ITEM, roleName, accountName]
  );
  // todo: handle error
  return rulesPerAccount.rows;
};