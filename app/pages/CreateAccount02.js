import React from 'react';
import { Link } from 'react-router';
import MobileLayout from './MobileLayout';
import CreateAccountNav from '../components/CreateAccountNav';
import CreateAccount02Body from '../components/CreateAccount02Body';

export default class CreateAccount02 extends React.Component {
  render() {
    return (
      <MobileLayout>
        <CreateAccountNav routerstep="/CreateAccount01" />
        <CreateAccount02Body />
      </MobileLayout>
    );
  }
}