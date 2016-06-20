import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';

import { Link } from 'react-router';
import { submitProfileDetails } from '../../actions/signUpActions';
class firstForm extends Component {

  onSubmit(props) {
    this.props.submitProfileDetails(props);
    this.context.router.push(this.props.nextRoute);
  }

  render() {

    const { fields: { first_name, last_name, middle_name, country_name }, handleSubmit } = this.props;

    return (
      <div className='createAccount04Body'>
        <form role='form' onSubmit={ handleSubmit(this.onSubmit.bind(this)) }>
          <div className='form-group'>
            <input type='text' className='form-control form-spacing text-center'
              { ...first_name } placeholder='First Name*' />
            <input type='text' className='form-control form-spacing text-center'
              { ...middle_name } placeholder='Middle Name*' />
            <input type='text' className='form-control form-spacing text-center'
              { ...last_name } placeholder='Last Name*' />
            <input type='text' className='form-control form-spacing text-center'
              { ...country_name } placeholder='Country*' />
            <Link to='/'><button type='submit' className='btn form-spacing btn-style'>Start Over</button></Link>
            <button type='submit' className='btn btn-primary form-spacing btn-style'>Next</button>
          </div>
        </form>
      </div>
    );
  }
}

firstForm.contextTypes = {
  router: PropTypes.object
};

firstForm.propTypes = {
  fields: PropTypes.object,
  handleSubmit: PropTypes.func,
  submitProfileDetails: PropTypes.func,
  nextRoute: PropTypes.string
};

export default reduxForm({
  form: 'firstForm',
  fields: [
    'first_name', 'last_name', 'middle_name', 'country_name'
  ],
  destroyOnUnmount: false
}, null, { submitProfileDetails })(firstForm);
