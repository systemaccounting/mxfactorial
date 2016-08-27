import React, { Component, PropTypes } from 'react';
import merge from 'lodash/merge';
import omit from 'lodash/omit';

import { getLocation, buildLatLng } from 'utils/geo';
import TransactionDetail from './TransactionDetail';
import AddTransactionBtn from './AddTransactionBtn';
import TransactionItem from './TransactionItem';
import ActionsSection from './ActionsSection';
import TransactionPopup from './TransactionPopup';
import RequestPopup from './RequestPopup';
import swapTransactionDbCr from 'utils/swapTransactionDbCr';
import TransactionDirection from './TransactionDirection';

export default class TransactionSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showTransactionPopup: false
    };
    this.handleUpdateField = this.handleUpdateField.bind(this);
    this.handlePost = this.handlePost.bind(this);
    this.handleAddTransaction = this.handleAddTransaction.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleRequest = this.handleRequest.bind(this);
  }

  handleClose() {
    this.props.updateError();
    this.setState({ showTransactionPopup: false });
  }

  handlePost(password) {
    if (!password) {
      this.props.updateError('Password Required');
    } else {
      const mergeAndPost = (position) => {
        const loc = buildLatLng(position);
        const data = merge(this.props.transaction, {
          db_latlng: loc,
          cr_latlng: loc
        });
        this.props.postTransaction(omit(data, ['cr_latlng', 'cr_time'])).then((action) => {
          if (!action.error) {
            this.context.router.push('/TransactionHistory/success');
          }
        });
      };

      getLocation(mergeAndPost);
    }

  }

  handleRequest(expirationTime) {
    const mergeAndPost = (position) => {
      const loc = buildLatLng(position);
      const data = merge(swapTransactionDbCr(this.props.transaction), {
        db_latlng: loc,
        cr_latlng: loc,
        expiration_time: expirationTime
      });
      this.props.postTransaction(omit(data, ['db_latlng', 'db_time'])).then((action) => {
        if (!action.error) {
          this.context.router.push('/Requests/RequestSent');
        }
      });
    };

    getLocation(mergeAndPost);
  }

  handleUpdateField(key, field, event) {
    const { updateTransaction } = this.props;
    const { value } = event.target;
    updateTransaction({ key, field, value });
  }

  handleAddTransaction() {
    const { cr_account, addTransaction } = this.props;
    addTransaction(cr_account);
  }

  renderActionsSection() {
    return this.props.transaction_item.length ?
      <ActionsSection
        handleTransact={ () => {this.setState({ showTransactionPopup: true });} }
        handleRequest={ () => {this.setState({ showRequestPopup: true });} }/>
      : null;
  }

  renderTransactionPopup() {
    return this.state.showTransactionPopup ?
      <TransactionPopup
        transactionError={ this.props.transactionError }
        handlePost={ this.handlePost }
        transactionAmount={ this.props.transactionAmount }
        handleCancel={ this.handleClose }/>
      : null;
  }

  renderRequestPopup() {
    return this.state.showRequestPopup ?
      <RequestPopup
        handleRequest={ this.handleRequest }
        handleCancel={ () => { this.setState({ showRequestPopup: false }); } }/>
      : null;
  }

  render() {
    const { transaction_item, removeTransaction, transactionAmount, updateCRAccount,
      account, transactionDirection, setTransactionDirection } = this.props;
    const that = this;

    return (
      <div className='container' style={ { width: 300 } }>
        <TransactionDetail
          updateCRAccount={ updateCRAccount }
          transactionAmount={ transactionAmount }
          account={ account }/>
        {
          transaction_item.map((item, key) => (
            <TransactionItem key={ item.key } item={ item }
              handleRemove={ removeTransaction.bind(that, key) }
              handleUpdateField={ that.handleUpdateField.bind(null, key) }/>
          ))
        }
        <TransactionDirection direction={ transactionDirection }
          handleDebit={ setTransactionDirection.bind(this, 'debit') }
          handleCredit={ setTransactionDirection.bind(this, 'credit') }/>
        <AddTransactionBtn handleClick={ this.handleAddTransaction }/>
        { this.renderActionsSection() }
        { this.renderTransactionPopup() }
        { this.renderRequestPopup() }
      </div>
    );
  }
}

TransactionSection.propTypes = {
  cr_account: PropTypes.string,
  transaction: PropTypes.object,
  transaction_item: PropTypes.array,
  transactionAmount: PropTypes.number,
  transactionError: PropTypes.string,
  removeTransaction: PropTypes.func.isRequired,
  updateTransaction: PropTypes.func.isRequired,
  addTransaction: PropTypes.func.isRequired,
  postTransaction: PropTypes.func.isRequired,
  updateCRAccount: PropTypes.func.isRequired,
  updateError: PropTypes.func.isRequired,
  account: PropTypes.string,
  transactionDirection: PropTypes.string,
  setTransactionDirection: PropTypes.func.isRequired
};

TransactionSection.defaultProps = {
  transaction_item: [],
  transactionAmount: 0
};

TransactionSection.contextTypes = {
  router: PropTypes.object
};
