import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class AccountSettingAction extends Component {
  render() {
    const { handleChangePassword, handleEditProfile } = this.props;
    const buttonClass = 'indicator radius5 text-center font22 action-section__btn';

    return (
      <div className='actions-section'>
        <div className={ `${buttonClass} btn__change-password` } onClick={ handleChangePassword }>Change Password</div>
        <div className={ `${buttonClass} btn__edit-profile` } onClick={ handleEditProfile }>Edit Profile</div>
      </div>
    );
  }
}

AccountSettingAction.propTypes = {
  handleChangePassword: PropTypes.func.isRequired,
  handleEditProfile: PropTypes.func.isRequired
};
