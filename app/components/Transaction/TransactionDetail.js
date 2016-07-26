import React, { Component, PropTypes } from 'react';
import numeral from 'numeral';

import { MONEY_FORMAT } from 'constants/index';

export default class TransactionDetail extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.updateCRAccount(event.target.value);
  }

  render() {
    const { transactionAmount } = this.props;
    return (
      <div className='input-group'>
        <div className='indicator radius5'>
          <div className='pull-left'>
            Sandy<br />
               balance
          </div>
          <div className='pull-right font22'>
              1,000.000
          </div>
        </div>
        <div className='input radius5 font22'>
          <input type='text' placeholder='user' className='text-center' onChange={ this.handleChange }/>
        </div>
        <div className='indicator radius5 font22 text-right'>
          <div>
            { numeral(transactionAmount).format(MONEY_FORMAT) }
          </div>
        </div>
      </div>
    );
  }
}

TransactionDetail.propTypes = {
  transactionAmount: PropTypes.number,
  updateCRAccount: PropTypes.func
};
