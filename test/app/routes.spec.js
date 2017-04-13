import React from 'react';
import { Router, hashHistory } from 'react-router';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, scryRenderedComponentsWithType
} from 'react-addons-test-utils';
import { Provider } from 'react-redux';
import configureStore from 'store/configureStore';

import getRoutes from 'routes';
import LandingScreen from 'components/LandingScreen/LandingScreen';

describe('routes', () => {
  let instance;
  const store = configureStore();

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should be renderable', () => {
    instance = renderIntoDocument(
      <Provider store={ store }>
        <Router history={ hashHistory }>
          { getRoutes(store) }
        </Router>
      </Provider>
    );
    instance.should.be.ok();
    scryRenderedComponentsWithType(instance, LandingScreen).length.should.equal(1);
  });
});
