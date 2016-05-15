import React from 'react';
import { Link } from 'react-router';
import MobileLayout from './MobileLayout';
import CreateAccountNav from '../components/CreateAccountNav';
import CreateAccount06Body from '../components/CreateAccount06Body';

export default class CreateAccount06 extends React.Component {
  render() {
    return (
      <MobileLayout>
        <CreateAccountNav routerstep="/CreateAccount05" />
        <CreateAccount06Body />
      </MobileLayout>
    );
  }
}