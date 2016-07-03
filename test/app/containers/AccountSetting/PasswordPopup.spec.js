import React from 'react';
import configureStore from 'redux-mock-store';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument,
  findRenderedDOMComponentWithClass
} from 'react-addons-test-utils';

import PasswordPopup from 'containers/AccountSetting/PasswordPopup';

describe('PasswordPopup container', () => {
  let instance;
  const mockStore = configureStore();

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should be renderable', () => {
    const store = mockStore({
      accountSetting: {
        errorMessage: 'Error'
      },
      auth: {
        user: {}
      }
    });

    instance = renderIntoDocument(
      <PasswordPopup store={ store } />
    );

    findRenderedDOMComponentWithClass(instance, 'error-message').textContent.should.equal('Error');
  });
});
