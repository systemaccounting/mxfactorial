import React, { Component, PropTypes } from 'react';

export default class AccountProfileConfirm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: ''
    };
    this.handlePost = this.handlePost.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
  }

  componentDidMount() {
    document.body.style.overflowY = 'hidden';
  }

  componentWillUnmount() {
    document.body.style.overflowY = '';
    this.props.updateAccountSettingError();
  }

  handleCancel() {
    this.props.reset('accountProfileForm');
    this.context.router.push('/AccountProfile');
  }

  handlePost() {
    const password = this.refs.password.value;
    if (!password) {
      this.setState({
        error: 'Password required'
      });
    } else {
      const { patchProfile, profile, account } = this.props;

      patchProfile({
        account,
        profile,
        password
      }).then((action) => {
        action.payload.success && this.context.router.push('/AccountProfile/Success');
      });
    }
  }

  render() {
    const { profile, errorMessage } = this.props;
    const buttonClass = 'indicator radius5 text-center font22 modal__btn';

    return (
      <div className='transaction-modal'>
        <div className='transaction-popup'>
          <div className='indicator radius5 font22 text-center transaction-amount'>
              { profile.first_name } Profile
          </div>
          <div>
            Enter password:
          </div>
          <div className='input radius5 font22'>
            <input type='password' ref={ 'password' } placeholder='********' className='text-center'/>
          </div>
          <div className='error-message'>
            <div>{ this.state.error }</div>
            <div>{ errorMessage }</div>
          </div>
          <div className='modal__footer text-center'>
            <button className={ `${buttonClass} btn__cancel` }
              onClick={ this.handleCancel }>
              Cancel
            </button>
            <button className={ `${buttonClass} btn__ok` }
              onClick={ this.handlePost }>
              OK
            </button>
          </div>
        </div>
      </div>
    );
  }
}

AccountProfileConfirm.contextTypes = {
  router: PropTypes.object
};

AccountProfileConfirm.propTypes = {
  account: PropTypes.string,
  profile: PropTypes.object,
  patchProfile: PropTypes.func,
  errorMessage: PropTypes.string,
  updateAccountSettingError: PropTypes.func,
  reset: PropTypes.func
};
