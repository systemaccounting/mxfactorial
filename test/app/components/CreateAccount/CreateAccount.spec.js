import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'store/configureStore';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, scryRenderedComponentsWithType
} from 'react-addons-test-utils';

import CreateAccount from 'components/CreateAccount/CreateAccount';
import MobileLayout from 'components/Layout/MobileLayout';
import CreateAccountNav from 'components/CreateAccountNav/CreateAccountNav';
import {
  FirstForm, SecondForm, ThirdForm, FourthForm, FifthForm, SixthForm
} from 'containers/CreateAccountForms';

describe('CreateAccount component', () => {
  let instance;
  const params = { id: '0' };
  const store = configureStore();

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should render correct body', () => {
    instance = renderIntoDocument(
      <Provider store={ store }>
        <CreateAccount params={ params }/>
      </Provider>
    );
    scryRenderedComponentsWithType(instance, MobileLayout).length.should.equal(1);
    scryRenderedComponentsWithType(instance, CreateAccountNav).length.should.equal(1);
    scryRenderedComponentsWithType(instance, FirstForm).length.should.equal(1);
  });

  it('should render FirstForm when id equal 1', () => {
    params.id = '1';
    instance = renderIntoDocument(
      <Provider store={ store }>
        <CreateAccount params={ params }/>
      </Provider>
    );
    scryRenderedComponentsWithType(instance, FirstForm).length.should.equal(1);
  });

  it('should render SecondForm when id equal 2', () => {
    params.id = '2';
    instance = renderIntoDocument(
      <Provider store={ store }>
        <CreateAccount params={ params }/>
      </Provider>
    );
    scryRenderedComponentsWithType(instance, SecondForm).length.should.equal(1);
  });

  it('should render ThirdForm when id equal 3', () => {
    params.id = '3';
    instance = renderIntoDocument(
      <Provider store={ store }>
        <CreateAccount params={ params }/>
      </Provider>
    );
    scryRenderedComponentsWithType(instance, ThirdForm).length.should.equal(1);
  });

  it('should render FourthForm when id equal 4', () => {
    params.id = '4';
    instance = renderIntoDocument(
      <Provider store={ store }>
        <CreateAccount params={ params }/>
      </Provider>
    );
    scryRenderedComponentsWithType(instance, FourthForm).length.should.equal(1);
  });

  it('should render FifthForm when id equal 5', () => {
    params.id = '5';
    instance = renderIntoDocument(
      <Provider store={ store }>
        <CreateAccount params={ params }/>
      </Provider>
    );
    scryRenderedComponentsWithType(instance, FifthForm).length.should.equal(1);
  });

  it('should render SixthForm when id equal 6', () => {
    params.id = '6';
    instance = renderIntoDocument(
      <Provider store={ store }>
        <CreateAccount params={ params }/>
      </Provider>
    );
    scryRenderedComponentsWithType(instance, SixthForm).length.should.equal(1);
  });
});
