import React, { Component, PropTypes } from 'react';
import numeral from 'numeral';

import { MONEY_FORMAT } from 'constants/index';
import './TransactionPopup.scss';

export default class TransactionPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      password: ''
    };
    this.handlePost = this.handlePost.bind(this);
  }

  componentDidMount() {
    document.body.style.overflowY = 'hidden';
  }

  componentWillUnmount() {
    document.body.style.overflowY = '';
  }

  handlePost() {
    this.props.handlePost(this.refs.password.value);
  }

  render() {
    const { transactionAmount, handleCancel, transactionError, direction } = this.props;
    const buttonClass = 'indicator radius5 text-center font22 modal__btn';

    return (
      <div className='transaction-modal'>
        <div className='transaction-popup'>
          <div className='indicator radius5 font22 text-center transaction-amount'>
              { numeral(transactionAmount * direction).format(MONEY_FORMAT) }
          </div>
          <div>
            Enter password:
          </div>
          <div className='input radius5 font22'>
            <input type='password' ref={ 'password' } placeholder='********' className='text-center'/>
          </div>
          <div className='error-message'>
            { transactionError }
          </div>
          <div className='modal__footer text-center'>
            <button className={ `${buttonClass} btn__cancel` } onClick={ handleCancel }>Cancel</button>
            <button className={ `${buttonClass} btn__ok` }
              onClick={ this.handlePost }>
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }
}

TransactionPopup.propTypes = {
  transactionError: PropTypes.string,
  transactionAmount: PropTypes.number,
  direction: PropTypes.number,
  handleCancel: PropTypes.func.isRequired,
  handlePost: PropTypes.func.isRequired
};

TransactionPopup.defaultProps = {
  transactionAmount: 0,
  direction: -1
};
