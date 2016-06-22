import React, { Component } from 'react';

import { Link } from 'react-router';

import Header from 'components/Header/header';

import './Home.scss';

import TransactionContainer from 'containers/Transaction';


export default class HomePage extends Component {
  render() {
    return (
      <div className="home-page">
        <Header className="font18"/>
        <TransactionContainer />
      </div>
    );
  }
}
