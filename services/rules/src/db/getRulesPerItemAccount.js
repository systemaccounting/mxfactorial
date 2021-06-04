const {
  TRANSACTION_ITEM,
  ACCOUNT_PROFILE_SQL,
  ACCOUNT_ROLE_TRS_SQL,
  STATE_NAME_TRS_SQL,
} = require('../constants');

module.exports = async function(db, roleName, accountName) {
  const accountProfile = await db.query(
    ACCOUNT_PROFILE_SQL, [accountName]
  );
  const rulesPerStateName = await db.query(
    STATE_NAME_TRS_SQL,
    [TRANSACTION_ITEM, roleName, accountProfile.rows[0].state_name]
  );
  const rulesPerAccountRole = await db.query(
    ACCOUNT_ROLE_TRS_SQL,
    [TRANSACTION_ITEM, roleName, accountName]
  );
  // todo: handle error
  return [...rulesPerAccountRole.rows, ...rulesPerStateName.rows];
};