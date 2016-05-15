import React from 'react';
import { Link } from 'react-router';
import MobileLayout from './MobileLayout';
import CreateAccountNav from '../components/CreateAccountNav';
import CreateAccount09Body from '../components/CreateAccount09Body';

export default class CreateAccount09 extends React.Component {
  render() {
    return (
      <MobileLayout>
        <CreateAccountNav routerstep="/CreateAccount08" />
        <CreateAccount09Body />
      </MobileLayout>
    );
  }
}