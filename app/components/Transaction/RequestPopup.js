import React, { Component } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';

import './RequestPopup.scss';

import { MONEY_FORMAT } from 'constants/index';

export default class RequestPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expirationTime: 0
    };
    this.handleRequest = this.handleRequest.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    document.body.style.overflowY = 'hidden';
  }

  componentWillUnmount() {
    document.body.style.overflowY = '';
  }

  handleRequest() {
    this.props.handleRequest(this.refs.password.value, this.state.expirationTime);
  }

  handleChange(event) {
    this.setState({
      expirationTime: Number(event.target.value) || 0
    });
  }

  render() {
    const { handleCancel, transactionAmount, transactionError } = this.props;
    const buttonClass = 'indicator radius5 text-center font22 modal__btn';

    return (
      <div className='transaction-modal'>
        <div className='transaction-popup'>
          <div className='indicator radius5 font22 text-center transaction-amount'>
            { numeral(transactionAmount).format(MONEY_FORMAT) }
          </div>
          <div>
            Expiration:
          </div>
          <div className='indicator radius5 font22 text-right'>
            <span/>
            <input type='number' className='expiration text-right' onChange={ this.handleChange }/>
            <span>
              day{ this.state.expirationTime > 1 ? 's' : null }
            </span>
          </div>
          <div>
            Enter password:
          </div>
          <div className='input radius5 font22'>
            <input type='password' ref={ 'password' } placeholder='********' className='text-center password'/>
          </div>
          <div className='error-message'>
            { transactionError }
          </div>
          <div className='modal__footer text-center'>
            <button className={ `${buttonClass} btn__cancel` } onClick={ handleCancel }>Cancel</button>
            <button className={ `${buttonClass} btn__ok` }
              onClick={ this.handleRequest }>
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }
}

RequestPopup.propTypes = {
  handleCancel: PropTypes.func.isRequired,
  handleRequest: PropTypes.func.isRequired,
  transactionAmount: PropTypes.number,
  transactionError: PropTypes.string
};
