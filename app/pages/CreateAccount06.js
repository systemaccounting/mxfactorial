import React from 'react';
import { Link } from 'react-router';
import MobileLayout from './MobileLayout';
import CreateAccountNav from '../components/CreateAccountNav';
import ThirdForm from '../components/signUpForms/thirdForm';
export default class CreateAccount06 extends React.Component {
  render() {
    return (
      <MobileLayout>
        <CreateAccountNav routerstep="/CreateAccount05" />
        <ThirdForm />
      </MobileLayout>
    );
  }
}