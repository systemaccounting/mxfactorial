import React from 'react';
import { Provider } from 'react-redux';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument,
  findRenderedDOMComponentWithClass
} from 'react-addons-test-utils';

import AccountProfileConfirm from 'containers/AccountProfileSetting/AccountProfileConfirm';
import configureStore from 'store/configureStore';

describe('AccountProfileConfirm container', () => {
  let instance;

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should be renderable', () => {
    const store = configureStore({
      accountSetting: {
        errorMessage: 'Error'
      },
      form: {
        accountProfileForm: {
          first_name: {}
        }
      }
    }, true);

    instance = renderIntoDocument(
      <Provider store={ store }>
        <AccountProfileConfirm store={ store } />
      </Provider>
    );

    findRenderedDOMComponentWithClass(instance, 'error-message').textContent.should.equal('Error');
  });
});
