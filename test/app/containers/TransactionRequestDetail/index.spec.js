import React from 'react';
import { Provider } from 'react-redux';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument,
  scryRenderedComponentsWithType
} from 'react-addons-test-utils';

import TransactionRequestDetail from 'containers/TransactionRequestDetail';
import configureStore from 'store/configureStore';

describe('TransactionRequestDetail container', () => {
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
        <TransactionRequestDetail params={ { id: '0' } }/>
      </Provider>
    );
    scryRenderedComponentsWithType(instance, TransactionRequestDetail).length.should.equal(1);
  });
});
