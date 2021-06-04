const { ARG_COUNT_ERROR } = require('../constants');

module.exports = function(
  authAccount,
  transaction,
) {
  const requiredArgCount = 2;
  if (arguments.length != requiredArgCount) {
    // todo: test
    throw new Error(ARG_COUNT_ERROR);
  };
  return {
    auth_account: authAccount,
    transaction: transaction
  };
};