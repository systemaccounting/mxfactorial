import React from 'react';
import { Provider } from 'react-redux';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument,
  scryRenderedComponentsWithType
} from 'react-addons-test-utils';

import TransactionRequests from 'containers/Requests/TransactionRequests';
import configureStore from 'store/configureStore';

describe('TransactionRequests container', () => {
  let instance;

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should be renderable', () => {
    const store = configureStore({
      notifications: {
        0: {
          key: '0'
        }
      },
      transactions: {
        0: {}
      }
    }, true);

    instance = renderIntoDocument(
      <Provider store={ store }>
        <TransactionRequests />
      </Provider>
    );
    scryRenderedComponentsWithType(instance, TransactionRequests).length.should.equal(1);
  });
});
