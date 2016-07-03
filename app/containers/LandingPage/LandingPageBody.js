import { connect } from 'react-redux';

import LandingPageBody from 'components/LandingPage/LandingPageBody';
import { login } from 'actions/authActions';

const mapDispatchToProps = {
  login
};

export default connect(null, mapDispatchToProps)(LandingPageBody);
