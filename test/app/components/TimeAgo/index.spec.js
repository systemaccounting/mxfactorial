import React from 'react';
import moment from 'moment';
import { unmountComponentAtNode, findDOMNode } from 'react-dom';
import {
  renderIntoDocument, findRenderedDOMComponentWithTag
} from 'react-addons-test-utils';

import ParentFactory from 'helpers/parent-component';
import TimeAgo from 'components/TimeAgo';
import { DATE_FORMAT, TZ } from 'constants/index';

describe('HomePage components', () => {
  let instance;

  afterEach(() => {
    instance && unmountComponentAtNode(findDOMNode(instance).parentNode);
  });

  it('should be renderable', () => {
    const currentTime = moment('20160701', 'YYYYMMDD').add({ hour: 3 });
    let time = moment(currentTime).subtract(10, 'seconds');
    const Parent = ParentFactory(TimeAgo, { time: time.format() });

    instance = renderIntoDocument(
      Parent()
    );

    instance.refs.child.setState({
      currentTime
    });

    let spanEl = findRenderedDOMComponentWithTag(instance.refs.child, 'span');
    spanEl.textContent.should.equal('10 seconds ago');

    time = moment(currentTime).subtract(2, 'hours');
    instance.setState({
      time: time.format()
    });
    spanEl.textContent.should.equal(`Today @ ${time.tz(TZ).format(DATE_FORMAT.timeOnlyWithTimezone)}`);

    time = moment(currentTime).subtract(4, 'hours');
    instance.setState({
      time: time.format()
    });
    spanEl.textContent.should.equal(`Yesterday @ ${time.tz(TZ).format(DATE_FORMAT.timeOnlyWithTimezone)}`);

    time = moment(currentTime).add(1, 'days');
    instance.setState({
      time: time.format()
    });
    spanEl.textContent.should.equal(time.tz(TZ).format(DATE_FORMAT.fullDateWithTimezone));

    instance.setState({
      time: undefined
    });
    spanEl.textContent.should.equal('Unknown');
  });
});
