import React, { Component, PropTypes } from 'react';

import './EmailInput.scss';

export default class EmailInput extends Component {
  render() {
    var { email, handleClick } = this.props;

    return (
      <div>
        <div style={ { marginBottom: 10 } }>
          Receipt & alert email address
        </div>
        <div className='input-group text-right'>
          <div className='indicator radius5 font22 text-center email-input' onClick={ handleClick }>
            { email }
          </div>
        </div>
      </div>
    );
  }
}

EmailInput.propTypes = {
  email: PropTypes.string,
  handleClick: PropTypes.func.isRequired
};

EmailInput.defaultProps = {
  email: 'sandy@gmail.com'
};
