import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './RequestBtn.scss';

export default class RequestBtn extends Component {
  render() {
    const { handleRequest, disabled } = this.props;
    const buttonClass = 'indicator radius5 text-center font22 action-section__btn' + (disabled ? ' disabled' : '');

    return (
      <div className='actions-section'>
        <div className={ `${buttonClass} btn__request` } onClick={ disabled ? null : handleRequest }>Request</div>
      </div>
    );
  }
}

RequestBtn.propTypes = {
  handleRequest: PropTypes.func,
  disabled: PropTypes.bool
};
