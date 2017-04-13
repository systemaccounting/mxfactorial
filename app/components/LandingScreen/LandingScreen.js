import React, { Component, PropTypes } from 'react';

import Logo from './Logo';
import MobileLayout from 'components/Layout/MobileLayout';
import LandingScreenContent from 'containers/LandingScreen/LandingScreenContent';

export default class LandingScreen extends Component {
  render() {
    const { state } = this.props.location;

    return (
      <MobileLayout>
        <Logo />
        <LandingScreenContent nextPathName={ state && state.nextPathName } />
      </MobileLayout>
    );
  }
}

LandingScreen.propTypes = {
  location: PropTypes.object
};
