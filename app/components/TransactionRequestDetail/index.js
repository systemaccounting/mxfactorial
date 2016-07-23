import React, { Component, PropTypes } from 'react';
import isEmpty from 'lodash/isEmpty';

import Header from 'components/Header/Header';
import TransactionHeader from './TransactionHeader';
import TransactionInfo from './TransactionInfo';
import TransactionAction from './TransactionAction';
import TransactionDetailItem from './TransactionDetailItem';
import TransactionPopup from 'components/Transaction/TransactionPopup';

export default class TransactionRequestDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showTransactionPopup: false
    };
    this.handleTransact = this.handleTransact.bind(this);
    this.handleReject = this.handleReject.bind(this);
  }

  componentDidMount() {
    const { transactId, getTransactionById, transaction } = this.props;
    if (isEmpty(transaction)) {
      getTransactionById(transactId);
    }
  }

  handleTransact() {
    this.context.router.push('/TransactionHistory/success');
  }

  handleReject() {}

  renderTransactionPopup() {
    return this.state.showTransactionPopup ?
      <TransactionPopup
        handlePost={ this.handleTransact }
        transactionAmount={ this.props.transactionTotal }
        handleCancel={ () => (this.setState({ showTransactionPopup: false })) }/>
      : null;
  }

  render() {
    const { transaction, transactionTotal, transactId, notification } = this.props;

    return (
      <div className='transaction-details'>
        <Header className='font18'/>
        <div className='container' style={ { width: 300 } }>
          <TransactionHeader/>
          <TransactionInfo
            transaction={ transaction }
            transactionTotal={ transactionTotal }
            notification={ notification }/>
          <TransactionAction
            handleTransact={ () => { this.setState({ showTransactionPopup: true }); } }
            handleReject={ this.handleReject } />
          <TransactionDetailItem items={ transaction.transaction_item } />

          <div className='transaction-details__key indicator radius5'>
            { transactId }
          </div>

          <div className='transaction-details__pre-trans'>
            <div>Pre-transaction balanace</div>
            <div className='indicator radius5'>
              <span className='pull-right'>1,000.00</span>
            </div>
          </div>

          { this.renderTransactionPopup() }
        </div>
      </div>
    );
  }
}

TransactionRequestDetail.propTypes = {
  transactId: PropTypes.string,
  getTransactionById: PropTypes.func,
  transaction: PropTypes.object,
  transactionTotal: PropTypes.number,
  notification: PropTypes.object
};

TransactionRequestDetail.defaultProps = {
  transaction: {}
};

TransactionRequestDetail.contextTypes = {
  router: PropTypes.object
};
