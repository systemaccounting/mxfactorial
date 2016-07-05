import React, { Component, PropTypes } from 'react';

export default class AccountProfileForm extends Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(props) {
    this.context.router.push('/AccountProfile/Confirm');
  }

  render() {

    const { fields: {
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      street_number,
      street_name,
      unit_number,
      floor_number,
      city,
      state,
      postal_code,
      country,
      telephone_country_code,
      telephone_area_code,
      telephone_number,
      occupation,
      industry
    }, handleSubmit } = this.props;

    return (
      <div className='edit-profile-form'>
        <div className='header-title font22 text-center'>Profile of { first_name.value }</div>

        <form role='form' onSubmit={ handleSubmit(this.onSubmit.bind(this)) }>
          <div className='form-group'>
            <input type='text' className='form-control form-spacing text-center'
              { ...first_name } placeholder='First Name' />
            <input type='text' className='form-control form-spacing text-center'
              { ...middle_name } placeholder='Middle Name' />
            <input type='text' className='form-control form-spacing text-center'
              { ...last_name } placeholder='Last Name' />
            <input type='text' className='form-control form-spacing text-center'
              { ...country } placeholder='Country' />

            <input type='text' className='form-control form-spacing text-center'
              { ...street_number } placeholder='Street Number' />
            <input type='text' className='form-control form-spacing text-center'
              { ...street_name } placeholder='Street Name' />
            <input type='text' className='form-control form-spacing text-center'
              { ...floor_number } placeholder='Floor Number' />
            <input type='text' className='form-control form-spacing text-center'
              { ...unit_number } placeholder='Unit' />

            <input type='text' className='form-control form-spacing text-center'
              { ...city } placeholder='City' />
            <input type='text' className='form-control form-spacing text-center'
              { ...state } placeholder='State' />
            <input type='text' className='form-control form-spacing text-center'
              { ...postal_code } placeholder='postal code' />

            <input type='text' className='form-control form-spacing text-center'
              { ...telephone_country_code } placeholder='country dialing code' />
            <input type='text' className='form-control form-spacing text-center'
              { ...telephone_area_code } placeholder='area code' />
            <input type='text' className='form-control form-spacing text-center'
              { ...telephone_number } placeholder='phone number' />

            <input type='date' className='form-control form-spacing text-center'
              { ...date_of_birth } placeholder='Date of Birth' />
            <input type='text' className='form-control form-spacing text-center'
              { ...industry } placeholder='Industry' />
            <input type='text' className='form-control form-spacing text-center'
              { ...occupation } placeholder='Occupation' />
            <button type='submit' className='btn btn-primary form-spacing btn-style'>
              Save
            </button>
          </div>
        </form>
      </div>
    );
  }
}

AccountProfileForm.contextTypes = {
  router: PropTypes.object
};

AccountProfileForm.propTypes = {
  fields: PropTypes.object,
  handleSubmit: PropTypes.func
};
