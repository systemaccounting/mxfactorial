import React from 'react';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, findRenderedDOMComponentWithClass, Simulate, findRenderedDOMComponentWithTag
} from 'react-addons-test-utils';
import { spy } from 'sinon';
import 'should-sinon';

import AccountProfileConfirm from 'components/AccountProfileSetting/AccountProfileConfirm';

describe('AccountProfileConfirm component', () => {
  let instance;
  const props = {
    profile: {
      first_name: 'sandy'
    },
    updateAccountSettingError: spy()
  };

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should handle OK', () => {
    const mockAction = {
      payload: {
        success: true
      }
    };
    props.patchProfile = () => ({
      then: (f) => { f(mockAction); }
    });

    instance = renderIntoDocument(
      <AccountProfileConfirm { ...props }/>
    );

    const push = spy();
    instance.context.router = { push };

    const errorMessage = findRenderedDOMComponentWithClass(instance, 'error-message');

    const btnOk = findRenderedDOMComponentWithClass(instance, 'btn__ok');
    const passwordInput = findRenderedDOMComponentWithTag(instance, 'input');
    Simulate.click(btnOk);
    errorMessage.textContent.should.equal('Password required');

    passwordInput.value = 'abcd1234';
    Simulate.change(passwordInput);
    Simulate.click(btnOk);

    push.should.be.calledWith('/AccountProfile/Success');
  });

  it('should handle Cancel', () => {
    instance = renderIntoDocument(
      <AccountProfileConfirm { ...props }/>
    );

    const push = spy();
    instance.context.router = { push };

    const btnCancel = findRenderedDOMComponentWithClass(instance, 'btn__cancel');

    Simulate.click(btnCancel);

    push.should.be.calledWith('/AccountProfile');
  });
});
