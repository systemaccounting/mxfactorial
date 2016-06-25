import React, { Component, PropTypes } from 'react';

import './TransactionItem.scss';

export default class TransactionItem extends Component {
  render() {
    const { item, handleRemove, handleUpdateField } = this.props;

    return (
      <div className='input-group transaction-item'>
        <span className='btn__remove glyphicon glyphicon-remove text-center' onClick={ handleRemove }/>
        <div className='input radius5 font22'>
          <input type='text' placeholder='item' className='text-center'
            defaultValue={ item.name } onBlur={ handleUpdateField.bind(null, 'name') }/>
        </div>
        <div className='input radius5 font22'>
          <input type='number' placeholder='value' className='text-center'
            defaultValue={ item.value.toFixed(3) } onBlur={ handleUpdateField.bind(null, 'value') }/>
        </div>
        <div>
          <div className='pull-left field--half field__label text-center'>
            Qty
          </div>
          <div className='input radius5 font22 field--half pull-right'>
            <input type='number' className='text-right'
              defaultValue={ item.quantity } onBlur={ handleUpdateField.bind(null, 'quantity') }/>
          </div>
        </div>
      </div>
    );
  }
}

TransactionItem.propTypes = {
  handleRemove: PropTypes.func.isRequired,
  handleUpdateField: PropTypes.func.isRequired,
  item: PropTypes.shape({
    name: PropTypes.string,
    quantity: PropTypes.number,
    value: PropTypes.number,
    cr_account: PropTypes.string
  })
};

TransactionItem.defaultProps = {
  item: {
    name: '',
    quantity: 0,
    value: 0.000,
    cr_account: ''
  }
};
