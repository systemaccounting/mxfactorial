import React from 'react';
import { Link } from 'react-router';
import MobileLayout from './MobileLayout';
import CreateAccountNav from '../components/CreateAccountNav';
import CreateAccount10Body from '../components/CreateAccount10Body';

export default class CreateAccount10 extends React.Component {
  render() {
    return (
      <MobileLayout>
        <div></div>
        <CreateAccount10Body />
      </MobileLayout>
    );
  }
}