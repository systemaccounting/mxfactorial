import React from 'react';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, scryRenderedComponentsWithType,
  findRenderedDOMComponentWithClass, Simulate
} from 'react-addons-test-utils';
import { spy } from 'sinon';
import 'should-sinon';

import AccountSettingSection from 'components/AccountSetting/AccountSettingSection';
import EmailInput from 'components/AccountSetting/EmailSetting/EmailInput';
import NotificationSetting from 'components/AccountSetting/NotificationSetting';
import AccountSettingAction from 'components/AccountSetting/AccountSettingAction';

describe('AccountSettingSection component', () => {
  let instance;

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should be renderable', () => {
    instance = renderIntoDocument(
      <AccountSettingSection />
    );

    scryRenderedComponentsWithType(instance, EmailInput).length.should.equal(1);
    scryRenderedComponentsWithType(instance, NotificationSetting).length.should.equal(1);
    scryRenderedComponentsWithType(instance, AccountSettingAction).length.should.equal(1);
  });

  it('should navigate to NewEmail', () => {
    instance = renderIntoDocument(
      <AccountSettingSection />
    );

    const push = spy();
    instance.context.router = { push };

    const emailInput = findRenderedDOMComponentWithClass(instance, 'email-input');

    Simulate.click(emailInput);

    push.should.be.calledWith('/AccountSetting/NewEmail');
  });

  it('should navigate to NewPassword', () => {
    instance = renderIntoDocument(
      <AccountSettingSection />
    );

    const push = spy();
    instance.context.router = { push };

    const btnChangePassword = findRenderedDOMComponentWithClass(instance, 'btn__change-password');

    Simulate.click(btnChangePassword);

    push.should.be.calledWith('/AccountSetting/NewPassword');
  });
});
