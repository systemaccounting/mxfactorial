import React, { Component, PropTypes } from 'react';

import './TransactionPopup.scss';

export default class TransactionPopup extends Component {
  componentDidMount() {
    document.body.style.overflowY = 'hidden';
  }

  componentWillUnmount() {
    document.body.style.overflowY = '';
  }

  render() {
    const { transactionAmount, handleCancel, handlePost, transactionError } = this.props;
    const buttonClass = 'indicator radius5 text-center font22 modal__btn';

    return (
      <div className='transaction-modal'>
        <div className='transaction-popup'>
          <div className='indicator radius5 font22 text-center transaction-amount'>
              ({ transactionAmount.toFixed(3) })
          </div>
          <div>
            Enter password:
          </div>
          <div className='input radius5 font22'>
            <input type='password' placeholder='********' className='text-center'/>
          </div>
          <div className='error-message'>
            { transactionError }
          </div>
          <div className='modal__footer text-center'>
            <button className={ `${buttonClass} btn__cancel` } onClick={ handleCancel }>Cancel</button>
            <button className={ `${buttonClass} btn__ok` } onClick={ handlePost }>OK</button>
          </div>
        </div>
      </div>
    );
  }
}

TransactionPopup.propTypes = {
  transactionError: PropTypes.string,
  transactionAmount: PropTypes.number,
  handleCancel: PropTypes.func.isRequired,
  handlePost: PropTypes.func.isRequired
};

TransactionPopup.defaultProps = {
  transactionAmount: 0
};
