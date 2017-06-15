import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './TransactBtn.scss';

export default class TransactBtn extends Component {
  render() {
    const { handleTransact, disabled } = this.props;
    const buttonClass = 'indicator radius5 text-center font22 action-section__btn' + (disabled ? ' disabled' : '');

    return (
      <div className='actions-section'>
        <div className={ `${buttonClass} btn__transact` } onClick={ disabled ? null : handleTransact }>Transact</div>
      </div>
    );
  }
}

TransactBtn.propTypes = {
  handleTransact: PropTypes.func,
  disabled: PropTypes.bool
};
