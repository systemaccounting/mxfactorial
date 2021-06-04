const {
  APPROVAL_SQL,
  APPROVAL_COUNT_ERROR,
} = require('../constants');

module.exports = async function(
  db,
  accountName,
  ) {
  const { rows } = await db.query(APPROVAL_SQL, [accountName]);
  // todo: handle more errors
  if (!rows.length) {
    throw new Error(APPROVAL_COUNT_ERROR);
  };
  const itemApproverNames = rows.map(x => x.approver);
  return itemApproverNames;
};