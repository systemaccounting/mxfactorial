import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import Header from 'components/Header/header';

import './Home.scss';

import TransactionContainer from 'containers/Transaction';

export default class HomePage extends Component {
  render() {
    return (
      <div className="home-page">
        <Header className="font18" {...this.props }/>
        <TransactionContainer {...this.props}/>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let { accountDetails: { auth } } = state;

  return {
    user: auth.user
  }
}

export default connect(mapStateToProps)(HomePage)
