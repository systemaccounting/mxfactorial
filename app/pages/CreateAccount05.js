import React from 'react';
import { Link } from 'react-router';
import MobileLayout from './MobileLayout';
import CreateAccountNav from '../components/CreateAccountNav';
import CreateAccount05Body from '../components/CreateAccount05Body';

export default class CreateAccount05 extends React.Component {
  render() {
    return (
      <MobileLayout>
        <CreateAccountNav routerstep="/CreateAccount04" />
        <CreateAccount05Body />
      </MobileLayout>
    );
  }
}