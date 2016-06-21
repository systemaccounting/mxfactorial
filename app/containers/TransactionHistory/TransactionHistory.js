import React, { Component, PropTypes } from 'react';

import Header from '../../components/Header/header';

import './TransactionHistory.scss'

export default class TransactionHistory extends Component {

  showTransactionDetails() {
    this.context.router.push('/TransactionDetails')
  }

  render() {
    return (
      <div className="transaction-history">
        <Header className="font18"/>
        <div className="container" style={{width: 300}}>
          <div className="transaction-history__header">History</div>
          <div className="input-group">
            <div className="indicator radius5">
              <div className="pull-left">
                Sandy<br />
                   balance
              </div>
              <div className="pull-right font22">
                  1,000.000
              </div>
            </div>
          </div>
          <div>
            <div className="indicator radius5 transaction-history__item"
                onClick={this.showTransactionDetails.bind(this)}>
              <div className="transaction-item-header">35 seconds ago, DannysMarket</div>
              <div className="font22 text-right">(24.531)</div>
            </div>
            <div className="indicator radius5 transaction-history__item"
                onClick={this.showTransactionDetails.bind(this)}>
              <div className="transaction-item-header">Today @ 2:34 PM PDT, user2</div>
              <div className="font22 text-right">(2.000)</div>
            </div>
            <div className="indicator radius5 transaction-history__item"
                onClick={this.showTransactionDetails.bind(this)}>
              <div className="transaction-item-header">Yesterday @ 12:15 PM PDT, user33</div>
              <div className="font22 text-right">(45.000)</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

TransactionHistory.contextTypes = {
  router: PropTypes.object
}
