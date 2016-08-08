import React from 'react';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, findRenderedDOMComponentWithTag,
  findRenderedDOMComponentWithClass, Simulate
} from 'react-addons-test-utils';
import { spy } from 'sinon';
import 'should-sinon';

import EmailPopup from 'components/AccountSetting/EmailSetting/EmailPopup';

describe('EmailPopup component', () => {
  let instance;
  const props = {
    updateAccountSettingError: spy(),
    emailChanged: spy(),
    location: {
      query: {
        email: 'abc@abc.com'
      }
    }
  };

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should handle Cancel', () => {
    instance = renderIntoDocument(
      <EmailPopup { ...props }/>
    );

    const push = spy();
    instance.context.router = { push };

    const btnCancel = findRenderedDOMComponentWithClass(instance, 'btn__cancel');

    Simulate.click(btnCancel);

    push.should.be.calledWith('/AccountSetting?clear=true');
  });

  it('should handle form submit', () => {
    const mockAction = {
      payload: {
        success: true
      }
    };
    props.patchEmail = () => ({
      then: (f) => { f(mockAction); }
    });

    instance = renderIntoDocument(
      <EmailPopup { ...props }/>
    );

    const push = spy();
    instance.context.router = { push };

    const emailInput = findRenderedDOMComponentWithTag(instance, 'input');
    emailInput.value = 'email@email.email';
    Simulate.change(emailInput);

    const emailForm = findRenderedDOMComponentWithTag(instance, 'form');
    Simulate.submit(emailForm);

    props.emailChanged.should.be.calledWith('email@email.email');
    push.should.be.calledWith('/AccountSetting/EmailSuccess');
  });
});
