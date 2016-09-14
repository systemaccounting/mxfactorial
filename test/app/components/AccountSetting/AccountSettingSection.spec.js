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

import { emailChanged } from 'actions/accountSettingActions';
import AccountSettingSection from 'components/AccountSetting/AccountSettingSection';
import EmailInput from 'components/AccountSetting/EmailSetting/EmailInput';
import NotificationSetting from 'components/AccountSetting/NotificationSetting';
import AccountSettingAction from 'components/AccountSetting/AccountSettingAction';
import ParentFactory from 'helpers/parent-component';

var ReactTestUtils = require('react-addons-test-utils');

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

  it('should display modified email when email props is changed', () => {
    const initProps = {
      email: 'initemail.hello.com'
    };

    const Parent = ParentFactory(AccountSettingSection, initProps);

    instance = renderIntoDocument(
      <Provider store={ store }>
        <Parent/>
      </Provider>
    );
    const parent = findRenderedComponentWithType(instance, Parent);

    const newEmail = 'heythere@changed.com';
    parent.setState({
      email: newEmail
    });

    const emailInput = findRenderedDOMComponentWithClass(instance, 'email--input');
    emailInput.value.should.equal(newEmail);
  })

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
    ReactTestUtils.Simulate.change(emailInput);

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
