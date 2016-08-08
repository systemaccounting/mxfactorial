import React, { Component, PropTypes } from 'react';

import './EmailInput.scss';

export default class EmailInput extends Component {
  constructor(props) {
    super(props);
    this.handleBlur = this.handleBlur.bind(this);
  }

  handleBlur(event) {
    const { initialEmail, currentEmail, handleBlur } = this.props;
    if (initialEmail != currentEmail) {
      handleBlur({
        email: currentEmail
      });
    }
  }

  render() {
    var { currentEmail } = this.props;

    return (
      <div>
        <div style={ { marginBottom: 10 } }>
          Receipt & alert email address
        </div>
        <div className='input-group text-right'>
          <div className='indicator radius5 font22 text-center email-input'>
            <input className='email--input text-center' onBlur={ this.handleBlur } onChange= { this.props.onEmailChange } value={ currentEmail } />
          </div>
        </div>
      </div>
    );
  }
}

EmailInput.propTypes = {
  email: PropTypes.string,
  handleBlur: PropTypes.func
};

EmailInput.defaultProps = {
  email: ''
};
