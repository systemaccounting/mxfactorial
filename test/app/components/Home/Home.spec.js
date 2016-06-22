import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'store/configureStore';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, scryRenderedComponentsWithType
} from 'react-addons-test-utils';

import HomePage from 'components/Home/Home';
import Header from 'components/Header/Header';
import TransactionContainer from 'containers/Transaction';

describe('HomePage components', () => {
  let instance;
  const store = configureStore();

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should render Header and TransactionContainer', () => {
    instance = renderIntoDocument(
      <Provider store={ store }>
        <HomePage/>
      </Provider>
    );
    scryRenderedComponentsWithType(instance, Header).length.should.equal(1);
    scryRenderedComponentsWithType(instance, TransactionContainer).length.should.equal(1);
  });
});
