import { reduxForm } from 'redux-form';

import { submitProfileDetails, submitAuthDetails } from 'actions/signUpActions';
import {
  firstForm, secondForm, thirdForm, fourthForm, fifthForm, sixthForm
} from 'components/CreateAccountForms';

export const FirstForm = reduxForm({
  form: 'firstForm',
  fields: [
    'first_name', 'last_name', 'middle_name', 'country'
  ],
  destroyOnUnmount: false
}, null, { submitProfileDetails })(firstForm);

export const SecondForm = reduxForm({
  form: 'secondForm',
  fields: [
    'street_number', 'street_name', 'floor_number', 'unit_number'
  ],
  destroyOnUnmount: false
}, null, { submitProfileDetails })(secondForm);

export const ThirdForm = reduxForm({
  form: 'thirdForm',
  fields: [
    'city', 'state', 'postal_code'
  ],
  destroyOnUnmount: false
}, null, { submitProfileDetails })(thirdForm);

export const FourthForm = reduxForm({
  form: 'fourthForm',
  fields: [
    'telephone_country_code', 'telephone_area_code', 'telephone_number'
  ],
  destroyOnUnmount: false
}, null, { submitProfileDetails })(fourthForm);

export const FifthForm = reduxForm({
  form: 'fifthForm',
  fields: [
    'date_of_birth', 'industry', 'occupation'
  ],
  destroyOnUnmount: false
}, null, { submitProfileDetails })(fifthForm);

export const SixthForm = reduxForm({
  form: 'sixthForm',
  fields: [
    'account', 'password', 'email_address'
  ],
  destroyOnUnmount: false
}, null, { submitAuthDetails })(sixthForm);
