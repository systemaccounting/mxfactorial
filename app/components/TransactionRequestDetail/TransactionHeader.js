import React, { Component, PropTypes } from 'react';

import emailButton from 'images/emailButton.png';
import backIcon from 'images/backIcon.png';

export default class TransactionInfo extends Component {
  render() {
    return (
      <div className='transaction-details__header'>
        <img src={ backIcon } className='image pull-left btn__back'
          onClick={ this.context.router.goBack }/>
        Request
        <img src={ emailButton } className='image pull-right'/>
      </div>
    );
  }
}

TransactionInfo.contextTypes = {
  router: PropTypes.object
};
