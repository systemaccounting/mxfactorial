import React from 'react';
import { spy } from 'sinon';
import 'should-sinon';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, findRenderedDOMComponentWithTag, Simulate
} from 'react-addons-test-utils';

import BaseAccountForm from 'components/CreateAccountForms/BaseAccountForm';

describe('BaseAccountForm component', () => {
  let instance;
  const props = {
    handleSubmit: (f) => (f),
    nextRoute: 'next'
  };

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should handle submit', () => {
    instance = renderIntoDocument(<BaseAccountForm { ...props }/>);
    const push = spy();
    instance.context.router = { push };
    const form = findRenderedDOMComponentWithTag(instance, 'form');
    Simulate.submit(form);
    push.should.be.calledWith('next');
  });
});
