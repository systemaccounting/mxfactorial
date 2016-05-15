import React from 'react';
import { Link } from 'react-router';
import MobileLayout from './MobileLayout';
import CreateAccountNav from '../components/CreateAccountNav';
import CreateAccount03Body from '../components/CreateAccount03Body';

export default class CreateAccount03 extends React.Component {
  render() {
    return (
      <MobileLayout>
        <CreateAccountNav routerstep="/CreateAccount02" />
        <CreateAccount03Body />
      </MobileLayout>
    );
  }
}