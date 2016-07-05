import React, { Component, PropTypes } from 'react';

export default class EmailSuccess extends Component {
  render() {
    const buttonClass = 'indicator radius5 text-center font22 modal__btn';

    return (
      <div className='transaction-modal'>
        <div className='transaction-popup transaction-popup__success'>
          <div className='text-center'>
            Verification email with 10 minute expiration sent
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

EmailSuccess.contextTypes = {
  router: PropTypes.object
};
