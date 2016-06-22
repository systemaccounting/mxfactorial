import React, { Component, PropTypes } from 'react';

import Header from '../../components/Header/header';

import disputeButton from '../../../static/images/disputeButton.png';
import emailButton from '../../../static/images/emailButton.png';
import backIcon from '../../../static/images/backIcon.png';

import './TransactionDetails.scss'


export default class TransactionDetails extends Component {

  navigateBack() {
    this.context.router.goBack();
  }

  render() {
    return (
      <div className="transaction-details">
        <Header className="font18"/>
        <div className="container" style={{width: 300}}>
          <div className="transaction-details__header">
            <img src={backIcon} className="image pull-left"
            onClick={this.navigateBack.bind(this)}/>
            Detail
            <img src={emailButton} className="image pull-right"/>
          </div>
          <div className="transaction-details__info">
            <div className="indicator radius5 font22">
              <div>
                DannysMarket
              </div>
            </div>
            <div className="indicator radius5 font22">
              (24.531)
            </div>
            <div className="indicator radius5">
              <div>Thursday, June 11, 2015, 3:25:15 PM PDT</div>
            </div>
          </div>
          <div className="transaction-details__items">
            <div className="indicator radius5">
              2 x 3.500 <br/> milk
            </div>
            <div className="indicator radius5">
              2 x 3.250 <br/> bread
            </div>
            <div className="indicator radius5">
              1 x 9.000 <br/> honey
            </div>
            <div className="indicator radius5">
              1 x 2.030 <br/> state sales tax
            </div>
            <div className="indicator radius5">
              1 x 2.030 <br/> accounting
            </div>
          </div>
          <div className="transaction-details__key indicator radius5">
            0003456789012
          </div>
          <div className="transaction-details__pre-trans">
            <div>Pre-transaction balanace</div>
            <div className="indicator radius5">
              <span className="pull-right">1,000.00</span>
            </div>
          </div>
          <div className="transaction-details__con-trans">
            <div>Concurrent-transaction balanace</div>
            <div className="indicator radius5">
              <span className="pull-right">0.000</span>
            </div>
          </div>
          <div className="transaction-details__post-trans">
            <div>Post-transaction balanace</div>
            <div className="indicator radius5">
              <span className="pull-right">975.469</span>
            </div>
          </div>
          <div className="transaction-details__report-btn btn">
            Report
            <img src={disputeButton} className="image"/>
          </div>
        </div>
      </div>
    )
  }
}

TransactionDetails.contextTypes = {
  router: PropTypes.object
}
