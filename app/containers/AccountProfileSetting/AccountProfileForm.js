import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import AccountProfileForm from 'components/AccountProfileSetting/AccountProfileForm';

const form = reduxForm({
  form: 'accountProfileForm',
  fields: [
    'first_name', 'middle_name', 'last_name', 'date_of_birth', 'street_number', 'street_name', 'unit_number',
    'floor_number', 'city', 'state', 'postal_code', 'country', 'telephone_country_code', 'telephone_area_code',
    'telephone_number', 'occupation', 'industry'
  ],
  destroyOnUnmount: false
})(AccountProfileForm);

function mapStateToProps(state) {
  return {
    initialValues: state.auth.user.account_profile && state.auth.user.account_profile[0]
  };
}

export default connect(mapStateToProps)(form);

