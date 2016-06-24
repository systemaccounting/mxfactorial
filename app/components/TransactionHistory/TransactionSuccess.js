import React, { Component, PropTypes } from 'react';

import mxfactorial from 'images/mxfactorial.png';
import './TransactionSuccess.scss';

export default class TransactionSuccess extends Component {
  constructor(props) {
    super(props);
    this.handleOk = this.handleOk.bind(this);
    this.handleNew = this.handleNew.bind(this);
  }

  componentDidMount() {
    document.body.style.overflowY = 'hidden';
  }

  componentWillUnmount() {
    document.body.style.overflowY = '';
  }

  handleOk() {
    this.props.clearTransaction();
    this.context.router.push('/TransactionHistory');
  }

  handleNew() {
    this.props.clearTransaction();
    this.context.router.push('/home');
  }


  render() {
    const buttonClass = 'indicator radius5 text-center font22 modal__btn';

    return (
      <div className='transaction-modal'>
        <div className='transaction-popup transaction-popup__success'>
          <img src={ mxfactorial } className='center-block'/>
          <div className='modal__footer text-center'>
            <button className={ `${buttonClass} btn__new` } onClick={ this.handleNew }>New</button>
            <button className={ `${buttonClass} btn__ok` } onClick={ this.handleOk }>OK</button>
          </div>
        </div>
      </div>
    );
  }
}

TransactionSuccess.propTypes = {
  clearTransaction: PropTypes.func.isRequired
};

TransactionSuccess.contextTypes = {
  router: PropTypes.object
};
