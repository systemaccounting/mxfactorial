import React from 'react';
import { Link } from 'react-router';
import MobileLayout from './MobileLayout';
import CreateAccountNav from '../components/CreateAccountNav';
import SixthForm from '../components/signUpForms/sixthForm';

export default class CreateAccount09 extends React.Component {
  render() {
    return (
      <MobileLayout>
        <CreateAccountNav routerstep="/CreateAccount08" />
        <SixthForm />
      </MobileLayout>
    );
  }
}