import React, { Component, PropTypes } from 'react';

export default class RequestSentPopup extends Component {
  constructor(props) {
    super(props);
    this.handleOk = this.handleOk.bind(this);
    this.handleHistory = this.handleHistory.bind(this);
  }

  componentDidMount() {
    document.body.style.overflowY = 'hidden';
  }

  componentWillUnmount() {
    document.body.style.overflowY = '';
  }

  handleOk() {
    this.props.clearTransaction();
    this.context.router.push('/Requests');
  }

  handleHistory() {
    this.props.clearTransaction();
    this.context.router.push('/TransactionHistory');
  }


  render() {
    const buttonClass = 'indicator radius5 text-center font22 modal__btn';

    return (
      <div className='transaction-modal'>
        <div className='transaction-popup transaction-popup__success'>
          <div className='text-center'>Request Sent</div>
          <div className='modal__footer text-center'>
            <button className={ `${buttonClass} btn__history` } onClick={ this.handleHistory }>History</button>
            <button className={ `${buttonClass} btn__ok` } onClick={ this.handleOk }>OK</button>
          </div>
        </div>
      </div>
    );
  }
}

RequestSentPopup.propTypes = {
  clearTransaction: PropTypes.func.isRequired
};

RequestSentPopup.contextTypes = {
  router: PropTypes.object
};
