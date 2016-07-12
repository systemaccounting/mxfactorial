import map from 'lodash/map';
import React, { Component, PropTypes } from 'react';

export default class TransactionDetailItem extends Component {
  renderItem(item, key) {
    return (
      <div className='indicator radius5' key={ key }>
        { item.quantity } x { item.value.toFixed(3) } <br/> { item.name }
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
