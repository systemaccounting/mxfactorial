import React, { Component, PropTypes } from 'react';

export default class TransactionInfo extends Component {
  render() {
    const { transaction, transactionTotal } = this.props;

    return (
      <div className='transaction-details__info'>
        <div className='indicator radius5 font22'>
          <div style={ { height: 40 } }>
            { transaction.cr_author }
          </div>
        </div>
        <div className='indicator radius5 font22'>
          ({ transactionTotal.toFixed(3) })
        </div>
        <div className='indicator radius5'>
          <div className='text-left'>Time of request</div>
          <div className='text-right'>Thursday, June 11, 2015, 3:25:15 PM PDT</div>
        </div>
        <div className='indicator radius5'>
          <div className='text-left'>Time of expiration</div>
          <div className='text-right'>Thursday, June 11, 2015, 3:25:15 PM PDT</div>
        </div>
      </div>
    );
  }
}

TransactionInfo.propTypes = {
  transaction: PropTypes.object,
  transactionTotal: PropTypes.number
};
