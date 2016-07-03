import React, { Component, PropTypes } from 'react';

export default class AccountProfileSuccess extends Component {
  render() {
    const buttonClass = 'indicator radius5 text-center font22 modal__btn';

    return (
      <div className='transaction-modal'>
        <div className='transaction-popup transaction-popup__success'>
          <div className='text-center'>
            Profile Changed
          </div>
          <div className='modal__footer text-right'>
            <button
              className={ `${buttonClass} btn__ok` }
              onClick={ () => { this.context.router.push('/AccountProfile'); } }>
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }
}

AccountProfileSuccess.contextTypes = {
  router: PropTypes.object
};
