import React, { Component, PropTypes } from 'react';

import Logo from './Logo';
import MobileLayout from 'components/Layout/MobileLayout';
import LandingPageBody from 'containers/LandingPage/LandingPageBody';

export default class LandingPage extends Component {
  render() {
    const { state } = this.props.location;

    return (
      <MobileLayout>
        <Logo />
        <LandingPageBody nextPathName={ state && state.nextPathName } />
      </MobileLayout>
    );
  }
}

LandingPage.propTypes = {
  location: PropTypes.object
};
