import React, { PropTypes } from 'react';
import { Link } from 'react-router';

import BaseAccountForm from './BaseAccountForm';

export default class secondForm extends BaseAccountForm {

  getDispatchFunction() {
    return this.props.submitProfileDetails;
  }

  render() {

    const { fields: { street_number, street_name, floor_number, unit_number }, handleSubmit } = this.props;

    return (
      <div className='createAccount04Body'>
        <form role='form' onSubmit={ handleSubmit(this.onSubmit.bind(this)) }>
          <div className='form-group'>
            <input type='text' className='form-control form-spacing text-center'
              { ...street_number } placeholder='Street Number*' />
            <input type='text' className='form-control form-spacing text-center'
              { ...street_name } placeholder='Street Name*' />
            <input type='text' className='form-control form-spacing text-center'
              { ...floor_number } placeholder='Floor Number' />
            <input type='text' className='form-control form-spacing text-center'
              { ...unit_number } placeholder='Unit' />
            <Link to='/'><button type='submit' className='btn form-spacing btn-style'>Start Over</button></Link>
            <button type='submit' className='btn btn-primary form-spacing btn-style'>Next</button>
          </div>
        </form>
      </div>
    );
  }
}

secondForm.contextTypes = {
  router: PropTypes.object
};

secondForm.propTypes = {
  fields: PropTypes.object,
  handleSubmit: PropTypes.func,
  submitProfileDetails: PropTypes.func,
  nextRoute: PropTypes.string
};

