import React from 'react';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, findRenderedComponentWithType, scryRenderedComponentsWithType,
  findRenderedDOMComponentWithClass, Simulate, scryRenderedDOMComponentsWithTag
} from 'react-addons-test-utils';
import { spy } from 'sinon';
import 'should-sinon';

import TransactionSection from 'components/Transaction/TransactionSection';
import TransactionDetail from 'components/Transaction/TransactionDetail';
import AddTransactionBtn from 'components/Transaction/AddTransactionBtn';
import TransactionItem from 'components/Transaction/TransactionItem';
import ActionsSection from 'components/Transaction/ActionsSection';
import TransactionPopup from 'components/Transaction/TransactionPopup';

describe('TransactionSection component', () => {
  let instance;
  const addTransaction = spy();
  const removeTransaction = spy();
  const updateTransaction = spy();
  const props = { addTransaction, removeTransaction, updateTransaction };

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should render correct with no item', () => {
    instance = renderIntoDocument(<TransactionSection { ...props }/>);
    scryRenderedComponentsWithType(instance, TransactionItem).length.should.equal(0);
    scryRenderedComponentsWithType(instance, ActionsSection).length.should.equal(0);
    scryRenderedComponentsWithType(instance, TransactionPopup).length.should.equal(0);
    findRenderedComponentWithType(instance, TransactionDetail).should.be.ok();

    let addTransactionBtn = findRenderedComponentWithType(instance, AddTransactionBtn);
    addTransactionBtn = findRenderedDOMComponentWithClass(addTransactionBtn, 'indicator');
    Simulate.click(addTransactionBtn);
    props.addTransaction.should.be.calledOnce();
  });

  it('should render correct with items', () => {
    props.transaction_item = [
      {
        item: 'item1',
        quantity: 1,
        value: 25
      }
    ];
    props.transactionAmount = 25;

    instance = renderIntoDocument(<TransactionSection { ...props }/>);
    scryRenderedComponentsWithType(instance, TransactionPopup).length.should.equal(0);

    const actionsSection = findRenderedComponentWithType(instance, ActionsSection);
    const transactBtn = findRenderedDOMComponentWithClass(actionsSection, 'btn__transact');
    Simulate.click(transactBtn);

    const transactionPopup = findRenderedComponentWithType(instance, TransactionPopup);
    findRenderedDOMComponentWithClass(transactionPopup, 'transaction-amount').textContent.should.equal('(25)');
    const cancelBtn = findRenderedDOMComponentWithClass(transactionPopup, 'btn__cancel');
    Simulate.click(cancelBtn);
    scryRenderedComponentsWithType(instance, TransactionPopup).length.should.equal(0);

    const transactionItem = findRenderedComponentWithType(instance, TransactionItem);
    const btnRemove = findRenderedDOMComponentWithClass(transactionItem, 'btn__remove');
    Simulate.click(btnRemove);
    props.removeTransaction.should.be.calledWith(0);

    const [itemInput, valueInput, quantityInput] = scryRenderedDOMComponentsWithTag(transactionItem, 'input');
    itemInput.value.should.equal('item1');
    valueInput.value.should.equal('25.000');
    quantityInput.value.should.equal('1');
    itemInput.value = 'item2';
    Simulate.blur(itemInput);
    props.updateTransaction.should.be.calledWith({
      key: 0,
      field: 'item',
      value: 'item2'
    });
  });

});
