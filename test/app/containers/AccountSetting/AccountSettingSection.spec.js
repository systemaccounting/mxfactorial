import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument,
  scryRenderedComponentsWithType
} from 'react-addons-test-utils';

import AccountSettingSection from 'containers/AccountSetting/AccountSettingSection';
import AccountSettingSectionComponent from 'components/AccountSetting/AccountSettingSection';

describe('AccountSettingSection container', () => {
  let instance;
  const mockStore = configureStore();

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should be renderable', () => {
    const store = mockStore({
      auth: {
        user: {
          account_profile: [{
            email_address: 'test@test.test'
          }]
        }
      }
    });

    instance = renderIntoDocument(
      <Provider store={ store }>
        <AccountSettingSection/>
      </Provider>
    );

    scryRenderedComponentsWithType(instance, AccountSettingSectionComponent).length.should.equal(1);
  });
});
