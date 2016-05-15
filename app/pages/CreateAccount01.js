import React from 'react';
import { Link } from 'react-router';
import MobileLayout from './MobileLayout';
import CreateAccountNav from '../components/CreateAccountNav';
import CreateAccount01Body from '../components/CreateAccount01Body';

export default class CreateAccount01 extends React.Component {
  render() {
    return (
      <MobileLayout>
        <CreateAccountNav routerstep="/" />
        <CreateAccount01Body />
      </MobileLayout>
    );
  }
}