import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class EmailPopup extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillUnmount() {
    this.props.updateAccountSettingError();
  }

  handleSubmit(event) {
    event.preventDefault();

    const { patchEmail, account } = this.props;

    patchEmail({ account, email: this.refs.email.value }).then((action) => {
      if (action.payload.success) {
        this.props.emailChanged(this.refs.email.value);
        this.context.router.push('/AccountSetting/EmailSuccess');
      }
    });
  }

  render() {
    const { location, errorMessage } = this.props;
    const buttonClass = 'indicator radius5 text-center font22 modal__btn';

    return (
      <div className='transaction-modal'>
        <div className='transaction-popup'>
          <form role='form' onSubmit={ this.handleSubmit }>
            <div>
              Confirm new address:
            </div>
            <div className='input radius5 font22'>
              <input ref='email' type='email' className='text-center'
                defaultValue={ location.query.email } required={ true }/>
            </div>
            <div className='error-message'>
              { errorMessage }
            </div>
            <div className='modal__footer text-center'>
              <button
                type='button'
                className={ `${buttonClass} btn__cancel` }
                onClick={ () => { this.context.router.push('/AccountSetting'); } }>
                Cancel
              </button>
              <button type='submit' className={ `${buttonClass} btn__ok` }>OK</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

EmailPopup.propTypes = {
  account: PropTypes.string,
  patchEmail: PropTypes.func,
  errorMessage: PropTypes.string,
  updateAccountSettingError: PropTypes.func,
  emailChanged: PropTypes.func,
  location: PropTypes.object
};

EmailPopup.contextTypes = {
  router: PropTypes.object
};
