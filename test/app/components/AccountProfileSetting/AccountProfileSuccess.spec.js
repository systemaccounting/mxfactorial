import React from 'react';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, findRenderedDOMComponentWithClass, Simulate
} from 'react-addons-test-utils';
import { spy } from 'sinon';
import 'should-sinon';

import AccountProfileSuccess from 'components/AccountProfileSetting/AccountProfileSuccess';

describe('AccountProfileSuccess component', () => {
  let instance;

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should handle Ok', () => {
    instance = renderIntoDocument(
      <AccountProfileSuccess/>
    );

    const push = spy();
    instance.context.router = { push };

    const btnOk = findRenderedDOMComponentWithClass(instance, 'btn__ok');

    Simulate.click(btnOk);

    push.should.be.calledWith('/AccountProfile');
  });
});
