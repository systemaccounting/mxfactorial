import React from 'react';
import { Provider } from 'react-redux';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, Simulate, scryRenderedDOMComponentsWithClass, findRenderedComponentWithType
} from 'react-addons-test-utils';
import { spy } from 'sinon';
import 'should-sinon';
import configureStore from 'redux-mock-store';

import TransactionHistory from 'components/TransactionHistory/TransactionHistory';

describe('TransactionHistory component', () => {
  let instance;
  const push = spy();
  const mockStore = configureStore();
  const store = mockStore({
    auth: {
      user: {
        account_profile: [{
          email_address: 'test@test.test'
        }]
      }
    }
  });

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should navigate to TransactionDetails', () => {
    instance = renderIntoDocument(
      <Provider store={ store }>
        <TransactionHistory />
      </Provider>
    );
    const tsInstance = findRenderedComponentWithType(instance, TransactionHistory);
    tsInstance.context.router = { push };

    const historyItems = scryRenderedDOMComponentsWithClass(instance, 'transaction-history__item');
    Simulate.click(historyItems[0]);
    push.should.be.calledWith('/TransactionDetails');
  });
});
