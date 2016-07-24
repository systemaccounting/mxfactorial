import React from 'react';
import { Provider } from 'react-redux';
import { spy } from 'sinon';
import 'should-sinon';
import configureStore from 'store/configureStore';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, scryRenderedComponentsWithType, Simulate,
  findRenderedDOMComponentWithClass, findRenderedComponentWithType
} from 'react-addons-test-utils';

import TransactionRequestDetail from 'components/TransactionRequestDetail';
import Header from 'components/Header/Header';
import TransactionHeader from 'components/TransactionRequestDetail/TransactionHeader';
import TransactionInfo from 'components/TransactionRequestDetail/TransactionInfo';
import TransactionAction from 'components/TransactionRequestDetail/TransactionAction';
import TransactionDetailItem from 'components/TransactionRequestDetail/TransactionDetailItem';
import TransactionPopup from 'components/Transaction/TransactionPopup';

describe('TransactionRequestDetail components', () => {
  let instance;
  let getTransactionById = spy();
  let transactId = '0';
  let notification = {
    key: transactId
  };
  let transaction = {
    transaction_item: [{
      quantity: 1,
      value: 2,
      name: 'book'
    }]
  };
  let transactionTotal = 0;
  const props = {
    getTransactionById,
    transactId,
    notification,
    transaction,
    transactionTotal
  };
  const store = configureStore();

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should be renderable', () => {
    instance = renderIntoDocument(
      <Provider store={ store }>
        <TransactionRequestDetail { ...props }/>
      </Provider>
    );

    scryRenderedComponentsWithType(instance, Header).length.should.equal(1);
    scryRenderedComponentsWithType(instance, TransactionHeader).length.should.equal(1);
    scryRenderedComponentsWithType(instance, TransactionInfo).length.should.equal(1);
    scryRenderedComponentsWithType(instance, TransactionAction).length.should.equal(1);
    scryRenderedComponentsWithType(instance, TransactionDetailItem).length.should.equal(1);
    scryRenderedComponentsWithType(instance, TransactionPopup).length.should.equal(0);

    const btnTransact = findRenderedDOMComponentWithClass(instance, 'btn__transact');
    Simulate.click(btnTransact);
    const transactPopup = findRenderedComponentWithType(instance, TransactionPopup);
    const btnCancel = findRenderedDOMComponentWithClass(transactPopup, 'btn__cancel');
    Simulate.click(btnCancel);
    scryRenderedComponentsWithType(instance, TransactionPopup).length.should.equal(0);
  });

  it('should getTransactionById', () => {
    const emptyProps = {
      getTransactionById,
      transactId,
      transactionTotal,
      transaction: {}
    };
    instance = renderIntoDocument(
      <Provider store={ store }>
        <TransactionRequestDetail { ...emptyProps }/>
      </Provider>
    );

    getTransactionById.should.be.calledWith(transactId);
  });

  it('should handleBack', () => {
    instance = renderIntoDocument(
      <Provider store={ store }>
        <TransactionRequestDetail { ...props }/>
      </Provider>
    );

    const trsHeader = findRenderedComponentWithType(instance, TransactionHeader);
    const goBack = spy();
    trsHeader.context.router = {
      goBack
    };
    const btnBack = findRenderedDOMComponentWithClass(trsHeader, 'btn__back');
    Simulate.click(btnBack);
    goBack.should.be.calledOnce();
  });

  it('should handleTransact', () => {
    instance = renderIntoDocument(
      <Provider store={ store }>
        <TransactionRequestDetail { ...props }/>
      </Provider>
    );
    const trd = findRenderedComponentWithType(instance, TransactionRequestDetail);
    const push = spy();
    trd.context.router = {
      push
    };

    const btnTransact = findRenderedDOMComponentWithClass(trd, 'btn__transact');
    Simulate.click(btnTransact);
    const transactPopup = findRenderedComponentWithType(trd, TransactionPopup);
    const btnOk = findRenderedDOMComponentWithClass(transactPopup, 'btn__ok');
    Simulate.click(btnOk);
    push.should.be.calledWith('/TransactionHistory/success');
  });
});
