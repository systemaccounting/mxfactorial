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

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should handle Cancel', () => {
    instance = renderIntoDocument(
      <EmailPopup/>
    );

    const push = spy();
    instance.context.router = { push };

    const btnCancel = findRenderedDOMComponentWithClass(instance, 'btn__cancel');

    Simulate.click(btnCancel);

    push.should.be.calledWith('/AccountSetting');
  });

  it('should handle form submit', () => {
    instance = renderIntoDocument(
      <EmailPopup/>
    );

    const push = spy();
    instance.context.router = { push };

    const emailInput = findRenderedDOMComponentWithTag(instance, 'input');
    emailInput.value = 'email@email.email';
    Simulate.change(emailInput);

    const emailForm = findRenderedDOMComponentWithTag(instance, 'form');
    Simulate.submit(emailForm);

    push.should.be.calledWith('/AccountSetting/EmailSuccess');
  });
});
