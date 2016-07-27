import React from 'react';
import { spy } from 'sinon';
import 'should-sinon';
import { Provider } from 'react-redux';
import configureStore from 'store/configureStore';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, scryRenderedComponentsWithType, Simulate, findRenderedDOMComponentWithClass,
  findRenderedComponentWithType
} from 'react-addons-test-utils';

import Requests from 'components/Requests';
import PageLayout from 'components/Layout/PageLayout';
import TransactionRequests from 'components/Requests/TransactionRequests';
import FilterAction from 'components/Requests/FilterAction';


describe('Requests component', () => {
  let instance;
  const store = configureStore();

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should handleActive/handleReject', () => {
    const setRequestsFilter = spy();
    const getTransaction = spy();
    const notifications = {
      0: {
        key: 0
      }
    };

    instance = renderIntoDocument(
      <Provider store={ store }>
        <Requests
          setRequestsFilter={ setRequestsFilter }
          getTransaction={ getTransaction }
          notifications={ notifications }/>
      </Provider>
    );
    const requestComp = findRenderedComponentWithType(instance, Requests);

    getTransaction.should.be.calledOnce();
    scryRenderedComponentsWithType(requestComp, PageLayout).length.should.equal(1);
    scryRenderedComponentsWithType(requestComp, TransactionRequests).length.should.equal(1);
    scryRenderedComponentsWithType(requestComp, FilterAction).length.should.equal(1);


    const rejectBtn = findRenderedDOMComponentWithClass(requestComp, 'btn__rejected');
    Simulate.click(rejectBtn);
    setRequestsFilter.should.be.calledWith('rejected');

    const activeBtn = findRenderedDOMComponentWithClass(requestComp, 'btn__active');
    Simulate.click(activeBtn);
    setRequestsFilter.should.be.calledWith('active');


    const transactionRequestComp = findRenderedComponentWithType(requestComp, TransactionRequests);
    const push = spy();
    transactionRequestComp.context.router = {
      push
    };
    const item = findRenderedDOMComponentWithClass(transactionRequestComp, 'transaction-history__item');
    Simulate.click(item);
    push.should.be.calledWith('/TransactionRequestDetail/0');
  });
});
