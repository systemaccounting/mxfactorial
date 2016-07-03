import React from 'react';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, scryRenderedDOMComponentsWithTag,
  findRenderedDOMComponentWithClass, Simulate
} from 'react-addons-test-utils';
import { spy } from 'sinon';
import 'should-sinon';

import PasswordPopup from 'components/AccountSetting/PasswordSetting/PasswordPopup';

describe('PasswordPopup component', () => {
  let instance;
  const props = {
    updateAccountSettingError: spy()
  };

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should validate password', () => {
    instance = renderIntoDocument(
      <PasswordPopup { ...props }/>
    );
    instance.validatePassword({}).should.equal('All fields are required');

    const passwordNotSecureMessage = [
      'Password must be 8 characters,',
      'both numbers and letters,',
      'special characters permitted,',
      'spaces not permitted'].join(' ');

    instance.validatePassword({
      old_password: 'oldpass',
      new_password: 'newpass',
      new_password_confirm: 'newpass'
    }).should.equal(passwordNotSecureMessage);


    instance.validatePassword({
      old_password: 'oldpass',
      new_password: 'new pass',
      new_password_confirm: 'new pass'
    }).should.equal(passwordNotSecureMessage);

    instance.validatePassword({
      old_password: 'oldpass',
      new_password: 'newpasss',
      new_password_confirm: 'newpasss'
    }).should.equal(passwordNotSecureMessage);

    instance.validatePassword({
      old_password: 'oldpass',
      new_password: 'newpass1',
      new_password_confirm: 'newpass2'
    }).should.equal('Password missmatch');

    instance.validatePassword({
      old_password: 'oldpass',
      new_password: 'newpass1',
      new_password_confirm: 'newpass1'
    }).should.equal('');
  });

  it('should handle Cancel', () => {
    instance = renderIntoDocument(
      <PasswordPopup { ...props }/>
    );

    const push = spy();
    instance.context.router = { push };

    const btnCancel = findRenderedDOMComponentWithClass(instance, 'btn__cancel');

    Simulate.click(btnCancel);

    push.should.be.calledWith('/AccountSetting');
  });

  it('should handle Ok', () => {
    props.updateAccountSettingError = spy();
    const mockAction = {
      payload: {
        success: true
      }
    };
    props.patchPassword = () => ({
      then: (f) => { f(mockAction); }
    });

    instance = renderIntoDocument(
      <PasswordPopup { ...props }/>
    );

    const push = spy();
    instance.context.router = { push };

    const [oldInput, newInput, newConfirmInput] = scryRenderedDOMComponentsWithTag(instance, 'input');
    const btnOk = findRenderedDOMComponentWithClass(instance, 'btn__ok');

    oldInput.value = 'loremipsum';
    newInput.value = 'password123';
    newConfirmInput.value = 'missmatchpassword';
    Simulate.change(oldInput);
    Simulate.change(newInput);
    Simulate.change(newConfirmInput);
    Simulate.click(btnOk);
    props.updateAccountSettingError.should.be.calledWith('Password missmatch');

    oldInput.value = 'loremipsum';
    newInput.value = 'password123';
    newConfirmInput.value = 'password123';
    Simulate.change(oldInput);
    Simulate.change(newInput);
    Simulate.change(newConfirmInput);
    Simulate.click(btnOk);
    push.should.be.calledWith('/AccountSetting/PasswordSuccess');
  });
});
