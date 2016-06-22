import React, { Component } from 'react';

import Header from 'components/Header/Header';
import TransactionContainer from 'containers/Transaction';

import './Home.scss';

export default class HomePage extends Component {
  render() {
    return (
      <div className='home-page'>
        <Header className='font18'/>
        <TransactionContainer />
      </div>
    );
  }
}
