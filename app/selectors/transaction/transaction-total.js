import reduce from 'lodash/reduce';

const transactionTotal = (transaction_item) => (
  reduce(transaction_item, (memo, item) => (memo + item.value * item.quantity), 0)
);

export default transactionTotal;
