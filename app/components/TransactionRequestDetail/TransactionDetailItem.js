import map from 'lodash/map';
import React, { Component, PropTypes } from 'react';
import numeral from 'numeral';

import { MONEY_FORMAT } from 'constants/index';

export default class TransactionDetailItem extends Component {
  renderItem(item, key) {
    return (
      <div className='indicator radius5' key={ key }>
        { item.quantity } x { numeral(item.value).format(MONEY_FORMAT) } <br/> { item.name }
      </div>
    );
  }

  render() {
    const { items } = this.props;

    return (
      <div className='transaction-details__items'>
        { map(items, this.renderItem) }
      </div>
    );
  }
}

TransactionDetailItem.propTypes = {
  items: PropTypes.array
};
