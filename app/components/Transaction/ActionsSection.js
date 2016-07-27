import React, { Component, PropTypes } from 'react';

import './ActionsSection.scss';

export default class ActionsSection extends Component {
  render() {
    const buttonClass = 'indicator radius5 text-center font22 action-section__btn';
    const { handleTransact, handleRequest } = this.props;

    return (
      <div className='actions-section'>
        <div className={ `${buttonClass} btn__transact` } onClick={ handleTransact }>Transact</div>
        <div className={ `${buttonClass} btn__request` } onClick={ handleRequest }>Request</div>
        <div className={ `${buttonClass} btn__save` }>Save</div>
      </div>
    );
  }
}

ActionsSection.propTypes = {
  handleTransact: PropTypes.func,
  handleRequest: PropTypes.func
};
