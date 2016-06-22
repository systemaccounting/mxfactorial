import React, { Component, PropTypes } from 'react';

export default class BaseAccountForm extends Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.dispatchFunction = this.getDispatchFunction();
  }

  getDispatchFunction() {
    return () => {};
  }

  onSubmit(props) {
    this.dispatchFunction(props);
    this.context.router.push(this.props.nextRoute);
  }

  render() {
    const { handleSubmit } = this.props;

    return (
      <form onSubmit={ handleSubmit(this.onSubmit.bind(this)) }>
        <button type='submit'>submit</button>
      </form>
    );
  }
}

BaseAccountForm.propTypes = {
  handleSubmit: PropTypes.func,
  nextRoute: PropTypes.string
};

BaseAccountForm.contextTypes = {
  router: PropTypes.object
};
