import React from 'react';

import MobileLayout from '../Layout/MobileLayout';

import {
  Logo,
  LandingPageBody
} from '../../components';

export default class LandingPage extends React.Component {
  render() {
    return (
      <MobileLayout>
        <Logo />
        <LandingPageBody />
      </MobileLayout>
    );
  }
}