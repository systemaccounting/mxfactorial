import React, { Component } from 'react';
import PropTypes from 'prop-types';

import emailButton from 'images/emailButton.png';
import backIcon from 'images/backIcon.png';

export default class TransactionHeader extends Component {
  constructor(props) {
    super(props);
    this.handleBack = this.handleBack.bind(this);
  }

  handleBack() {
    this.context.router.goBack();
  }

  render() {
    return (
      <div className='transaction-details__header'>
        <img src={ backIcon } className='image pull-left btn__back'
          onClick={ this.handleBack }/>
        Request
        <img src={ emailButton } className='image pull-right'/>
      </div>
    );
  }
}

TransactionHeader.contextTypes = {
  router: PropTypes.object
};
