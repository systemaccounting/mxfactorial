const {
  ACCOUNT_ROLE_TRS_SQL,
  APPROVAL,
} = require('../constants');

module.exports = async function(
  db,
  roleName,
  approverName,
  ) {
  // rows.length == 0 ok
  const { rows } = await db.query(
    ACCOUNT_ROLE_TRS_SQL,
    [APPROVAL, roleName, approverName]
  );
  // todo: handle error
  return rows;
};