import React from 'react';
import { spy } from 'sinon';
import 'should-sinon';
import { Provider } from 'react-redux';
import configureStore from 'store/configureStore';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, findRenderedComponentWithType, Simulate, findRenderedDOMComponentWithClass
} from 'react-addons-test-utils';

import RequestSentPopup from 'components/Requests/RequestSentPopup';

describe('Requests component', () => {
  let instance;
  const store = configureStore();

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should handleHistory/handleOk', () => {
    const clearTransaction = spy();
    instance = renderIntoDocument(
      <Provider store={ store }>
        <RequestSentPopup clearTransaction={ clearTransaction }/>
      </Provider>
    );

    const reqPopup = findRenderedComponentWithType(instance, RequestSentPopup);
    const push = spy();
    reqPopup.context.router = {
      push
    };
    const historyBtn = findRenderedDOMComponentWithClass(reqPopup, 'btn__history');
    Simulate.click(historyBtn);
    push.should.be.calledWith('/TransactionHistory');
    clearTransaction.should.be.calledOnce();

    const okBtn = findRenderedDOMComponentWithClass(reqPopup, 'btn__ok');
    Simulate.click(okBtn);
    push.should.be.calledWith('/Requests');
    clearTransaction.should.be.calledTwice();
  });
});
