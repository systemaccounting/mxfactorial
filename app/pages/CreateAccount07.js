import React from 'react';
import { Link } from 'react-router';
import MobileLayout from './MobileLayout';
import CreateAccountNav from '../components/CreateAccountNav';
import FourthForm from '../components/signUpForms/fourthForm';

export default class CreateAccount07 extends React.Component {
  render() {
    return (
      <MobileLayout>
        <CreateAccountNav routerstep="/CreateAccount06" />
        <FourthForm />
      </MobileLayout>
    );
  }
}