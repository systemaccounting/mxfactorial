import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'store/configureStore';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, findRenderedDOMComponentWithClass, scryRenderedComponentsWithType
} from 'react-addons-test-utils';

import PageLayout from 'components/Layout/PageLayout';
import Header from 'components/Header/Header';

describe('PageLayout component', () => {
  let instance;
  const store = configureStore();

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should render Header and chilren', () => {
    instance = renderIntoDocument(
      <Provider store={ store }>
        <PageLayout>
          lorem ipsum
        </PageLayout>
      </Provider>
    );

    scryRenderedComponentsWithType(instance, Header).length.should.equal(1);
    findRenderedDOMComponentWithClass(instance, 'container').textContent.should.equal('lorem ipsum');
  });
});
