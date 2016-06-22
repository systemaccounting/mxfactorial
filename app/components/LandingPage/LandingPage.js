import React, { Component } from 'react';

import Logo from './Logo';
import MobileLayout from 'components/Layout/MobileLayout';
import LandingPageBody from './LandingPageBody';

export default class LandingPage extends Component {
  render() {
    return (
      <MobileLayout>
        <Logo />
        <LandingPageBody />
      </MobileLayout>
    );
  }
}
