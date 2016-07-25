import React from 'react';
import { spy } from 'sinon';
import 'should-sinon';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  Simulate, renderIntoDocument, findRenderedDOMComponentWithClass
} from 'react-addons-test-utils';

import NotificationMenu from 'components/Header/NotificationMenu';

describe('NotificationMenu component', () => {
  let instance;

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should handleClear', () => {
    const clearAll = spy();
    const notifications = {
      0: {},
      1: {}
    };

    instance = renderIntoDocument(
      <NotificationMenu clearAll={ clearAll } notifications={ notifications }/>
    );
    const flagBtn = findRenderedDOMComponentWithClass(instance, 'notification--button');
    Simulate.click(flagBtn);
    const clearBtn = findRenderedDOMComponentWithClass(instance, 'clearAllButton');
    Simulate.click(clearBtn);
    clearAll.should.be.calledWith(['0', '1']);
  });

  it('should handle readOne', () => {
    const readOne = spy();
    const notifications = {
      0: {}
    };

    instance = renderIntoDocument(
      <NotificationMenu readOne={ readOne } notifications={ notifications }/>
    );
    const flagBtn = findRenderedDOMComponentWithClass(instance, 'notification--button');
    Simulate.click(flagBtn);
    const itemLink = findRenderedDOMComponentWithClass(instance, 'notification--item-link');
    Simulate.click(itemLink);
    readOne.should.be.calledWith('0');
  });
});
