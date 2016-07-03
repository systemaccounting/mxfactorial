import React from 'react';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, findRenderedDOMComponentWithTag,
  findRenderedDOMComponentWithClass, Simulate
} from 'react-addons-test-utils';
import { spy } from 'sinon';
import 'should-sinon';

import LandingPageBody from 'components/LandingPage/LandingPageBody';

describe('LandingPageBody component', () => {
  let instance;

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should handle Ok', () => {
    let mockAction = {
      payload: new Error('Login failed'),
      error: true
    };
    const login = () => ({
      then: (f) => {
        f(mockAction);
      }
    });
    const props = {
      login
    };

    instance = renderIntoDocument(
      <LandingPageBody { ...props }/>
    );

    const push = spy();
    instance.context.router = { push };
    const loginForm = findRenderedDOMComponentWithTag(instance, 'form');

    Simulate.submit(loginForm);
    findRenderedDOMComponentWithClass(instance, 'error-message').textContent.should.equal('Login failed');

    mockAction = {
      payload: {
        user: {}
      }
    };
    Simulate.submit(loginForm);
    push.should.be.calledWith('/home');
  });
});
