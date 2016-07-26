import React, { Component, PropTypes } from 'react';

import './EmailInput.scss';

export default class EmailInput extends Component {
  constructor(props) {
    super(props);
    this.handleBlur = this.handleBlur.bind(this);
  }

  handleBlur(event) {
    const { email, handleBlur } = this.props;
    if (email != event.target.value) {
      handleBlur({
        email: event.target.value
      });
    }
  }

  render() {
    var { email } = this.props;

    return (
      <div>
        <div style={ { marginBottom: 10 } }>
          Receipt & alert email address
        </div>
        <div className='input-group text-right'>
          <div className='indicator radius5 font22 text-center email-input'>
            <input className='email--input text-center' defaultValue={ email } onBlur={ this.handleBlur } />
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
