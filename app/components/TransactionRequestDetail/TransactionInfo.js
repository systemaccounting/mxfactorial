import React, { Component, PropTypes } from 'react';

import TimeAgo from 'components/TimeAgo';

export default class TransactionInfo extends Component {
  render() {
    const { transaction, transactionTotal, notification } = this.props;

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
          <div className='text-right'><TimeAgo time={ notification && notification.sent_time }/></div>
        </div>
        <div className='indicator radius5'>
          <div className='text-left'>Time of expiration</div>
          <div className='text-right'><TimeAgo time={ transaction.expiration_time } /></div>
        </div>
      </div>
    );
  }
}

TransactionInfo.propTypes = {
  transaction: PropTypes.object,
  notification: PropTypes.object,
  transactionTotal: PropTypes.number
};
