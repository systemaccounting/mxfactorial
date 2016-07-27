import React, { Component, PropTypes } from 'react';

export default class TransactionAction extends Component {
  render() {
    const { handleTransact, handleReject } = this.props;
    const buttonClass = 'indicator radius5 text-center font22 action-section__btn';

    return (
      <div className='actions-section'>
        <div className={ `${buttonClass} btn__transact` } onClick={ handleTransact }>Transact</div>
        <div className={ `${buttonClass} btn__reject` } onClick={ handleReject }>Reject</div>
      </div>

    );
  }
}

TransactionAction.propTypes = {
  handleTransact: PropTypes.func,
  handleReject: PropTypes.func
};
