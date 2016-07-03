import React, { Component, PropTypes } from 'react';

import './PasswordPopup.scss';

export default class PasswordPopup extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUnmount() {
    this.props.updateAccountSettingError();
  }

  validatePassword(passwordForm) {
    const { old_password, new_password, new_password_confirm } = passwordForm;

    if (!old_password || !new_password || !new_password_confirm) {
      return ('All fields are required');
    } else if (new_password.length < 8
      || /\s/.test(new_password)
      || !/([A-Z]|[a-z])+[0-9]+[~@#$^*()_+=[\]{}|\\,.?:-]*/g.test(new_password)) {
      return ([
        'Password must be 8 characters,',
        'both numbers and letters,',
        'special characters permitted,',
        'spaces not permitted'].join(' '));
    } else if (new_password !== new_password_confirm) {
      return ('Password missmatch');
    }

    return '';
  }

  handleSubmit(event) {
    event.preventDefault();

    const { updateAccountSettingError, patchPassword, account } = this.props;
    const { new_password, new_password_confirm, old_password } = this.refs;
    const error = this.validatePassword({
      old_password: old_password.value,
      new_password: new_password.value,
      new_password_confirm: new_password_confirm.value
    });

    if (error) {
      updateAccountSettingError(error);
    } else {
      patchPassword({
        account,
        old_password: old_password.value,
        new_password: new_password.value
      }).then((action) => {
        action.payload.success && this.context.router.push('/AccountSetting/PasswordSuccess');
      });
    }
  }

  render() {
    const { errorMessage } = this.props;
    const buttonClass = 'indicator radius5 text-center font22 modal__btn';

    return (
      <div className='transaction-modal'>
        <div className='transaction-popup'>
          <div>
            Old password:
          </div>
          <div className='input radius5 font22'>
            <input ref='old_password' type='password' placeholder='********' className='text-center'/>
          </div>
          <div>
            New password:<span className='round-dot'>?</span>
          </div>
          <div className='input radius5 font22'>
            <input ref='new_password' type='password' placeholder='********' className='text-center'/>
          </div>
          <div className='input radius5 font22'>
            <input ref='new_password_confirm' type='password' placeholder='********' className='text-center'/>
          </div>
          <div className='error-message'>
            { errorMessage }
          </div>
          <div className='modal__footer text-right'>
            <button
              className={ `${buttonClass} btn__cancel` }
              onClick={ () => { this.context.router.push('/AccountSetting'); } }>
              Cancel
            </button>
            <button
              className={ `${buttonClass} btn__ok` }
              onClick={ this.handleSubmit }>
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }
}

PasswordPopup.propTypes = {
  errorMessage: PropTypes.string,
  updateAccountSettingError: PropTypes.func.isRequired,
  patchPassword: PropTypes.func,
  account: PropTypes.string
};

PasswordPopup.contextTypes = {
  router: PropTypes.object
};
