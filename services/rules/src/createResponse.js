const createSumValue = require('./createSumValue');
const createTransaction = require('./model/transaction');
const createIntraTransaction = require('./model/intraTransaction');

module.exports = function(transactionItems) {

	const sumValue = createSumValue(transactionItems);

	const transaction = createTransaction(
	  null,
	  null,
	  null,
	  null,
	  null,
	  null,
	  null,
	  sumValue,
	  transactionItems,
	);

	// wrap in IntraTransaction declared in
	// services/gopkg/types/transaction.go
	// todo: unit test
	const intraTransaction = createIntraTransaction(
	  null,
	  transaction,
	);

	return intraTransaction;
  };