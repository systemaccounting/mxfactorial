import React, { Component, PropTypes } from 'react';

import TransactionDetail from './TransactionDetail';
import AddTransactionBtn from './AddTransactionBtn';
import TransactionItem from './TransactionItem';
import ActionsSection from './ActionsSection';
import TransactionPopup from './TransactionPopup';

export default class TransactionSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showTransactionPopup: false
    }
    this.handleUpdateField = this.handleUpdateField.bind(this);
  }

  handleUpdateField(key, field, event) {
    const { updateTransaction } = this.props;
    const { value } = event.target;
    updateTransaction({key, field, value});
  }

  renderActionsSection() {
    return this.props.transaction_item.length ?
      <ActionsSection handleTransact={ () => {this.setState({showTransactionPopup: true});} }/>
      : null;
  }

  renderTransactionPopup() {
    return this.state.showTransactionPopup ?
      <TransactionPopup
        transactionAmount={this.props.transactionAmount}
        handleCancel={ () => {this.setState({showTransactionPopup: false});} }/>
      : null;
  }

	render() {
    const { transaction_item, removeTransaction, transactionAmount, addTransaction, user } = this.props;
    const that = this;

    return (
      <div className="container" style={{width: 300}}>
        <TransactionDetail transactionAmount={transactionAmount} user={user}/>
        <AddTransactionBtn handleClick={addTransaction}/>
        {
          transaction_item.map((item, key) => (
            <TransactionItem key={key} item={item}
              handleRemove={removeTransaction.bind(that, key)}
              handleUpdateField={that.handleUpdateField.bind(null, key)}/>
          ))
        }
        {this.renderActionsSection()}
        {this.renderTransactionPopup()}
      </div>
    );
  }
}

TransactionSection.propTypes = {
  user: PropTypes.object,
  transaction_item: PropTypes.array,
  transactionAmount: PropTypes.number,
  removeTransaction: PropTypes.func.isRequired,
  updateTransaction: PropTypes.func.isRequired,
  addTransaction: PropTypes.func.isRequired
};

TransactionSection.defaultProps = {
  transaction_item: [],
  transactionAmount: 0
};
