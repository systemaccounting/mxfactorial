import React, { Component, PropTypes } from 'react';
import moment from 'moment-timezone';

import { DATE_FORMAT, TZ } from 'constants/index';

export default class TimeAgo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: moment(props.time),
      currentTime: moment()
    };
  }

  componentDidMount() {
    global.setInterval(60000, this.updateCurrentTime);
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      time: moment(newProps.time)
    });
  }

  componentWillUnmount() {
    global.clearInterval(this.updateCurrentTime);
  }

  updateCurrentTime() {
    this.setState({
      currentTime: moment()
    });
  }

  timeFromNow() {
    const { time, currentTime } = this.state;
    if (!time.isValid() || !this.props.time) {
      return 'Unknown';
    }

    if (time.isBefore(currentTime)) {
      if (time.isAfter(moment(currentTime).subtract(60, 'seconds'))) {
        return `${(currentTime - time) / 1000} seconds ago`;
      } else if (time.isAfter(moment(currentTime).set({ hour: 0, minute: 0, second: 0 }))) {
        return `Today @ ${time.tz(TZ).format(DATE_FORMAT.timeOnlyWithTimezone)}`;
      } else if (time.isAfter(moment(currentTime).set({ day: -2, hour: 0, minute: 0, second: 0 }))) {
        return `Yesterday @ ${time.tz(TZ).format(DATE_FORMAT.timeOnlyWithTimezone)}`;
      }
    }

    return time.tz(TZ).format(DATE_FORMAT.fullDateWithTimezone);
  }

  render() {
    return (
      <span>{ this.timeFromNow() }</span>
    );
  }
}

TimeAgo.propTypes = {
  time: PropTypes.string
};
