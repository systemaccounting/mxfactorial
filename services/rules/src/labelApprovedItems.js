const {
  APPROVALS,
  CURRENT_TIMESTAMP,
  APPROVAL_TIME_SUFFIX,
  APPROVAL_COUNT_ERROR,
} = require('./constants');

module.exports = function(transactionItems, sequence) {
  // loop through all transaction items
  for (const item of transactionItems) {
    // repeated from getItemApproverNames.js in case of reuse
    if (!item[APPROVALS].length) {
      throw new Error(APPROVAL_COUNT_ERROR);
    };
    for (const role of sequence) {
      let notApproved = 0;
      const itemApprovers = item[APPROVALS].filter(x => x.account_role == role);
      for (const appr of itemApprovers) {
        // let the loop lapse to test all approvals applied
        if (appr.approval_time == CURRENT_TIMESTAMP) {
          continue;
        } else {
          notApproved++;
          break;
        };
      };
      // todo: report pending approvals
      if (notApproved == 0) {
        // debitor_approval_time OR creditor_approval_time
        item[role + '_' + APPROVAL_TIME_SUFFIX] = CURRENT_TIMESTAMP;
      };
    };
  };
  return transactionItems;
};