import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class PasswordSuccess extends Component {
  render() {
    const buttonClass = 'indicator radius5 text-center font22 modal__btn';

    return (
      <div className='transaction-modal'>
        <div className='transaction-popup transaction-popup__success'>
          <div className='text-center'>
            Password changed
          </div>
          <div className='modal__footer text-right'>
            <button
              className={ `${buttonClass} btn__ok` }
              onClick={ () => { this.context.router.push('/AccountSetting'); } }>
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }
}

PasswordSuccess.contextTypes = {
  router: PropTypes.object
};
