const {
  APPROVALS,
} = require('./constants');

module.exports = async function(
  sequence,
  db,
  transactionItems,
  getNamesFn,
  createObjFn,
  getRulesFn,
  applyRulesFn,
  ) {

  for (const preItem of transactionItems) {
    // push approvals here:
    preItem[APPROVALS] = new Array();
  };

  for (const role of sequence) {

    // add rule generated transaction items
    for (const item of transactionItems) {

      // get approvers per item
      const approverNames = await getNamesFn(db, item[role]);

      for (let i = 0; i < approverNames.length; i++) {
        const approverObject = createObjFn(
          null, // id
          null, // ruleInstanceId
          null, // transactionId,
          null, // transactionItemId
          approverNames[i],
          role,
          null, // deviceId
          null, // deviceLatLng
          null, // approvalTime
          null, // rejectionTime
          null, // expirationTime
        );

        const rulesPerApproval = await getRulesFn(
          db,
          role,
          approverNames[i],
        );

        const rulesAppliedApproval = applyRulesFn(
          approverObject,
          rulesPerApproval,
          item,
        );
        // todo: label item approval only
        item[APPROVALS].push(rulesAppliedApproval);
      };
    };
  };
  return transactionItems;
};