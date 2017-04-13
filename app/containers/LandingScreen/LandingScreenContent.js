import { connect } from 'react-redux';

import LandingScreenContent from 'components/LandingScreen/LandingScreenContent';
import { login } from 'actions/authActions';

const mapDispatchToProps = {
  login
};

export default connect(null, mapDispatchToProps)(LandingScreenContent);
