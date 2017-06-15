import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import './TransactionDirection.scss';

export default class TransactionDirection extends Component {
  constructor(props) {
    super(props);
    // this.state = {
    //   active: true
    // };
  }

  render() {
    const { handleDebit, handleCredit, direction } = this.props;

    const debitClassName = classnames('btn__debit font22', {
      active: direction === 'debit'
    });
    const creditClassName = classnames('btn__credit font22', {
      active: direction === 'credit'
    });

    return (
      <div className='toggle-button'>
        <div className={ debitClassName } onClick={ handleDebit }>(-) debit</div>
        <div className={ creditClassName } onClick={ handleCredit }>credit (+)</div>
      </div>
    );
  }
}

TransactionDirection.propTypes = {
  handleDebit: PropTypes.func,
  handleCredit: PropTypes.func,
  direction: PropTypes.string
};
