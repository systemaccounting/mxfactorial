const {
  RULE_INSTANCE_SQL,
  APPROVER,
} = require('../constants');

module.exports = async function(
  db,
  roleName,
  approverName,
  ) {
  // rows.length == 0 ok
  const { rows } = await db.query(
    RULE_INSTANCE_SQL,
    [APPROVER, roleName, approverName]
  );
  // todo: handle error
  return rows;
};