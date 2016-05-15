import React from 'react';
import { Link } from 'react-router';
import MobileLayout from './MobileLayout';
import Logo from '../components/Logo';
import LandingPageBody from '../components/LandingPageBody';

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