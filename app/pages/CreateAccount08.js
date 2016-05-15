import React from 'react';
import { Link } from 'react-router';
import MobileLayout from './MobileLayout';
import CreateAccountNav from '../components/CreateAccountNav';
import CreateAccount08Body from '../components/CreateAccount08Body';

export default class CreateAccount08 extends React.Component {
  render() {
    return (
      <MobileLayout>
        <CreateAccountNav routerstep="/CreateAccount07" />
        <CreateAccount08Body />
      </MobileLayout>
    );
  }
}