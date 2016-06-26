import React from 'react';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, findRenderedDOMComponentWithTag, Simulate
} from 'react-addons-test-utils';
import { spy, stub } from 'sinon';
import 'should-sinon';

import CreateAccount10Body from 'components/CreateAccountInfoBody/CreateAccount10Body';
import transformFormData from 'utils/transformFormData';

describe('TransactionSection component', () => {
  let instance;
  const postCreateAccount = stub();
  const accountDetails = {
    account: {
      auth: {
        user_name: 'nil',
        password: 'secret'
      },
      profile: {
        first_name: 'albert',
        last_name: 'einstein'
      }
    }
  };

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should handle createAccount', () => {
    postCreateAccount.returns({
      then: (f) => {
        f();
        return {
          catch: (f) => (f())
        };
      }
    });

    const push = spy();

    instance = renderIntoDocument(
      <CreateAccount10Body postCreateAccount={ postCreateAccount } accountDetails={ accountDetails }/>
    );

    instance.context.router = { push };

    const btnSubmit = findRenderedDOMComponentWithTag(instance, 'button');
    Simulate.click(btnSubmit);
    postCreateAccount.should.be.calledWith(transformFormData({
      user_name: 'nil',
      password: 'secret',
      first_name: 'albert',
      last_name: 'einstein'
    }));
    push.should.be.calledWith('/');
  });
});
