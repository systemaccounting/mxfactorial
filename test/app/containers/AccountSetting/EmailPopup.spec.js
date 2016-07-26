import React from 'react';
import configureStore from 'redux-mock-store';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument,
  findRenderedDOMComponentWithClass
} from 'react-addons-test-utils';

import EmailPopup from 'containers/AccountSetting/EmailPopup';

describe('EmailPopup container', () => {
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

    const location = {
      query: {
        email: 'abc@cba'
      }
    };

    instance = renderIntoDocument(
      <EmailPopup store={ store } location={ location } />
    );

    findRenderedDOMComponentWithClass(instance, 'error-message').textContent.should.equal('Error');
  });
});
