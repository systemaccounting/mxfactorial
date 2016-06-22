import React from 'react';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  Simulate, renderIntoDocument, findRenderedDOMComponentWithClass,
  scryRenderedDOMComponentsWithTag
} from 'react-addons-test-utils';
import { spy } from 'sinon';
import 'should-sinon';

import TransactionItem from 'components/Transaction/TransactionItem';

describe('TransactionItem component', () => {
  let instance;
  const props = {
    handleRemove: spy(),
    handleUpdateField: spy(),
    item: {
      item: 'first',
      quantity: 1,
      value: 3
    }
  };


  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should render correct data', () => {
    instance = renderIntoDocument(<TransactionItem { ...props } />);
    const [itemInput, valueInput, quantityInput] = scryRenderedDOMComponentsWithTag(instance, 'input');
    itemInput.value.should.equal('first');
    valueInput.value.should.equal('3.000');
    quantityInput.value.should.equal('1');
  });

  it('should handleRemove when user click on remove icon', () => {
    instance = renderIntoDocument(<TransactionItem { ...props } />);
    const btnRemove = findRenderedDOMComponentWithClass(instance, 'btn__remove');
    Simulate.click(btnRemove);
    props.handleRemove.should.be.calledOnce();
  });

  it('should handleUpdateField when user change value', () => {
    instance = renderIntoDocument(<TransactionItem { ...props } />);
    const [itemInput, valueInput, quantityInput] = scryRenderedDOMComponentsWithTag(instance, 'input');

    itemInput.value = 'item';
    Simulate.blur(itemInput);
    props.handleUpdateField.should.be.calledWith('item');

    valueInput.value = 30;
    Simulate.blur(valueInput);
    props.handleUpdateField.should.be.calledWith('value');

    quantityInput.value = 1;
    Simulate.blur(quantityInput);
    props.handleUpdateField.should.be.calledWith('quantity');
  });

});
