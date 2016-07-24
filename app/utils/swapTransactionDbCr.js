import map from 'lodash/map';

export default (transaction) => {
  const { cr_author, db_author, transaction_item } = transaction;
  const result = { ...transaction };
  result.cr_author = db_author;
  result.db_author = cr_author;
  result.transaction_item = map(transaction_item, (item) => {
    const { cr_account, db_account } = item;
    const returnItem = { ...item };
    returnItem.cr_account = db_account;
    returnItem.db_account = cr_account;
    return returnItem;
  });
  return result;
};
