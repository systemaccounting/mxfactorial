import React from 'react';
import { Provider } from 'react-redux';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, Simulate, findRenderedDOMComponentWithClass, findRenderedComponentWithType
} from 'react-addons-test-utils';
import { spy } from 'sinon';
import 'should-sinon';
import configureStore from 'redux-mock-store';

import TransactionDetails from 'components/TransactionDetails/TransactionDetails';

describe('TransactionDetails component', () => {
  let instance;
  const goBack = spy();
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
        <TransactionDetails />
      </Provider>
    );

    const tdInstance = findRenderedComponentWithType(instance, TransactionDetails);
    tdInstance.context.router = { goBack };

    const backBtn = findRenderedDOMComponentWithClass(instance, 'btn__back');
    Simulate.click(backBtn);
    goBack.should.be.calledOnce();
  });
});
