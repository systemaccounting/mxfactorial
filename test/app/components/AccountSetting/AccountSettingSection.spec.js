import React from 'react';
import { Provider } from 'react-redux';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, scryRenderedComponentsWithType, findRenderedComponentWithType,
  findRenderedDOMComponentWithClass, Simulate
} from 'react-addons-test-utils';
import { spy } from 'sinon';
import 'should-sinon';
import configureStore from 'redux-mock-store';

import AccountSettingSection from 'components/AccountSetting/AccountSettingSection';
import EmailInput from 'components/AccountSetting/EmailSetting/EmailInput';
import NotificationSetting from 'components/AccountSetting/NotificationSetting';
import AccountSettingAction from 'components/AccountSetting/AccountSettingAction';

describe('AccountSettingSection component', () => {
  let instance;
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

  it('should be renderable', () => {
    instance = renderIntoDocument(
      <Provider store={ store }>
        <AccountSettingSection />
      </Provider>
    );

    scryRenderedComponentsWithType(instance, EmailInput).length.should.equal(1);
    scryRenderedComponentsWithType(instance, NotificationSetting).length.should.equal(1);
    scryRenderedComponentsWithType(instance, AccountSettingAction).length.should.equal(1);
  });

  it('should navigate to NewEmail', () => {
    instance = renderIntoDocument(
      <Provider store={ store }>
        <AccountSettingSection />
      </Provider>
    );

    const push = spy();

    const ascInstance = findRenderedComponentWithType(instance, AccountSettingSection);
    ascInstance.context.router = { push };

    const emailInput = findRenderedDOMComponentWithClass(instance, 'email--input');
    emailInput.value='newmail@mail.com';

    Simulate.blur(emailInput);

    push.should.be.calledWith({
      pathname: '/AccountSetting/NewEmail',
      query: {
        email: 'newmail@mail.com'
      }
    });
  });

  it('should navigate to NewPassword', () => {
    instance = renderIntoDocument(
      <Provider store={ store }>
        <AccountSettingSection />
      </Provider>
    );

    const push = spy();

    const ascInstance = findRenderedComponentWithType(instance, AccountSettingSection);
    ascInstance.context.router = { push };

    const btnChangePassword = findRenderedDOMComponentWithClass(instance, 'btn__change-password');

    Simulate.click(btnChangePassword);

    push.should.be.calledWith({ pathname: "/AccountSetting/NewPassword", query: null });
  });
});
