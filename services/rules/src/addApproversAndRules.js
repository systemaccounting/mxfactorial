const {
  DEBITOR,
  CREDITOR,
  APPROVERS,
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
    // push approvers here:
    preItem[APPROVERS] = new Array();
  };

  for (const role of sequence) {

    // add rule generated transaction items
    for (const item of transactionItems) {

      // get approvers per item
      const approverNames = await getNamesFn(db, item[role]);

      for (let i = 0; i < approverNames.length; i++) {
        const approverObject = createObjFn(
          "", // id
          "", // ruleInstanceId
          "", // transactionId,
          "", // transactionItemId
          approverNames[i],
          role,
          null, // deviceId
          null, // deviceLatLng
          null, // approvalTime
          null, // rejectionTime
          null, // expirationTime
        );

        const rulesPerApprover = await getRulesFn(
          db,
          role,
          approverNames[i],
        );

        const rulesAppliedApprover = applyRulesFn(
          approverObject,
          rulesPerApprover,
          item,
        );
        // todo: label item approval only
        item[APPROVERS].push(rulesAppliedApprover);
      };
    };
  };
  return transactionItems;
};