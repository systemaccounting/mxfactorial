import { reduxForm } from 'redux-form';

import AccountProfileForm from 'components/AccountProfileSetting/AccountProfileForm';

export default reduxForm({
  form: 'accountProfileForm',
  fields: [
    'first_name', 'middle_name', 'last_name', 'date_of_birth', 'street_number', 'street_name', 'unit_number',
    'floor_number', 'city', 'state', 'postal_code', 'country', 'telephone_country_code', 'telephone_area_code',
    'telephone_number', 'occupation', 'industry'
  ],
  destroyOnUnmount: true
})(AccountProfileForm);

