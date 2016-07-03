import React from 'react';
import { Provider } from 'react-redux';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, scryRenderedComponentsWithType
} from 'react-addons-test-utils';

import configureStore from 'store/configureStore';
import AccountProfilePage from 'components/AccountProfileSetting/AccountProfilePage';
import Header from 'components/Header/Header';
import AccountProfileForm from 'containers/AccountProfileSetting/AccountProfileForm';

describe('AccountProfilePage component', () => {
  let instance;
  const store = configureStore(undefined, true);

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should be renderable', () => {
    instance = renderIntoDocument(
      <Provider store={ store }>
        <AccountProfilePage />
      </Provider>
    );

    scryRenderedComponentsWithType(instance, Header).length.should.equal(1);
    scryRenderedComponentsWithType(instance, AccountProfileForm).length.should.equal(1);
  });
});
