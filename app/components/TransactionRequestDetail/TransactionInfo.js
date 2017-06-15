import React, { Component } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';

import { MONEY_FORMAT } from 'constants/index';
import TimeAgo from 'components/TimeAgo';

export default class TransactionInfo extends Component {
  render() {
    const { transaction, transactionTotal, notification } = this.props;

    return (
      <div className='transaction-details__info'>
        <div className='indicator radius5 font22'>
          <div style={ { height: 40 } }>
            { transaction.created_by === transaction.db_author ? transaction.db_author : transaction.cr_author }
          </div>
        </div>
        <div className='indicator radius5 font22'>
          { numeral(transactionTotal * (notification && notification.payload
            && notification.payload.direction || 1)).format(MONEY_FORMAT) }
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
