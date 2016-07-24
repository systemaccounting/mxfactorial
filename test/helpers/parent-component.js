import React, { createFactory, createClass } from 'react';

export default (Children, state={}) => (
  createFactory(createClass({
    getInitialState() {
      return state;
    },

    render() {
      return <Children ref='child' { ...this.state } />;
    }
  }))
);
