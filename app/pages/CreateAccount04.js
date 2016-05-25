import React from 'react';
import { Link } from 'react-router';
import MobileLayout from './MobileLayout';
import CreateAccountNav from '../components/CreateAccountNav';
import CreateAccount04Body from '../components/CreateAccount04Body';
import FirstForm from '../components/signUpForms/firstForm'
export default class CreateAccount04 extends React.Component {
  render() {
    return (
      <MobileLayout>
        <CreateAccountNav routerstep="/CreateAccount03" />
        <FirstForm />
      </MobileLayout>
    );
  }
}