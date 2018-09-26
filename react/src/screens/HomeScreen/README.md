# step function workflow for transactions
1. transaction author (debitor or creditor) creates request* transaction in client
2. client sends transactions to POST /rule while added
3. POST /rule returns any rule-generated transactions to be included
4. transaction author sends authenticated POST /transact when finished adding transactions
5. /transact verifies received transactions against /rule (contains rule-generated transactions)
6. /transact adds timeuuid, transaction_id, latlng, and approval time stamp for initial POST /transact sender
7. /transact inserts updated transaction request into db
8. /transact sends request notification to transaction recipient
9. /transact returns updated transaction request to requester
10. request client displays transaction request awaiting approval
11. recipient client displays transaction request awaiting approval
12. transaction request recipient sends authenticated POST /transact when finished reviewing transactions
13. /transact verifies received transactions against /rule (contains rule-generated transactions)
14. /transact adds approval time stamp for second POST /transact sender
15. /transact inserts updated transaction request into db
16. /transact sends transaction completed notification to requester and recipient
17. client moves transaction from request to history for requester and recipient

*Note: accounts not assumed to accept transactions. therefore, all transactions begin as requests  
- [bid](https://en.wikipedia.org/wiki/Bid_price): debitor_approval_time && !creditor_approval_time  
- [ask](https://en.wikipedia.org/wiki/Ask_price): !debitor_approval_time && creditor_approval_time  
- [transaction](https://en.wiktionary.org/wiki/equilibrium_price): debitor_approval_time && creditor_approval_time  

# transaction model

```
{
  "transactions": [
    {
      "timeuuid": "",
      "debitor": "John",
      "debitor_profile_latlng": "51.2244, -12.12221",
      "debitor_transaction_latlng": "51.2244, -12.12221",
      "debitor_approval_time": "",
      "debitor_device": "",
      "creditor": "Mary",
      "creditor_profile_latlng": "51.2244, -12.12221",
      "creditor_transaction_latlng": "51.2244, -12.12221",
      "creditor_approval_time": "",
      "creditor_device": "51.2244, -12.12221",
      "name": "bread",
      "price": "3.00",
      "quantity": "2.00",
      "unit_of_measurement": "gram",
      "units_measured": "250",
      "rule_instance_id": "",
      "transaction_id": "12345",
      "debit_approver": "John",
      "credit_approver": "Mary",
      "author": "Mary",
      "expiration_time": "2018-10-26T21:32:52",
      "rejection_time": "2018-10-26T21:32:52"
    },
    {
      "timeuuid": "", //unique; returned from POST /transact
      "debitor": "John", //paying account; client-generated
      "debitor_profile_latlng": "51.2244, -12.12221", //returned from POST /transact
      "debitor_transaction_latlng": "51.2244, -12.12221", //client-generated; e.g. getCurrentPosition()
      "debitor_approval_time": "", //returned from POST /transact
      "debitor_device": "", //client-generated; e.g. navigator.userAgent
      "creditor": "Mary", //earning account; client-generated
      "creditor_profile_latlng": "51.2244, -12.12221", //returned from POST /transact
      "creditor_transaction_latlng": "51.2244, -12.12221", //client-generated; e.g. getCurrentPosition()
      "creditor_approval_time": "", //returned from POST /transact
      "creditor_device": "51.2244, -12.12221",
      "name": "milk", //client-generated
      "price": "4.00", //client-generated
      "quantity": "1.00", //client-generated
      "unit_of_measurement": "gallon", //client-generated
      "units_measured": "1", //client-generated
      "rule_instance_id": "", //returned from POST /rule
      "transaction_id": "12345", //common to all objects in array; returned from POST /rule
      "debit_approver": "John", //account responsible for adding timestamp to debitor_approval_time
      "credit_approver": "Mary", //account responsible for adding timestamp to creditor_approval_time
      "author": "Mary", //account responsible for creating transaction
      "expiration_time": "2018-10-26T21:32:52", //expiration time set by author
      "rejection_time": "2018-10-26T21:32:52" //time transaction request was rejected
    },
    {
      "timeuuid": "",
      "debitor": "John",
      "debitor_profile_latlng": "51.2244, -12.12221",
      "debitor_transaction_latlng": "51.2244, -12.12221",
      "debitor_approval_time": "",
      "debitor_device": "",
      "creditor": "Mary",
      "creditor_profile_latlng": "51.2244, -12.12221",
      "creditor_transaction_latlng": "51.2244, -12.12221",
      "creditor_approval_time": "",
      "creditor_device": "51.2244, -12.12221",
      "name": "honey",
      "price": "8.00",
      "quantity": "1.00",
      "unit_of_measurement": "ounce",
      "units_measured": "8",
      "rule_instance_id": "",
      "transaction_id": "12345",
      "debit_approver": "John",
      "credit_approver": "Mary",
      "author": "Mary",
      "expiration_time": "2018-10-26T21:32:52",
      "rejection_time": "2018-10-26T21:32:52"
    },
    {
      "timeuuid": "",
      "debitor": "John",
      "debitor_profile_latlng": "51.2244, -12.12221",
      "debitor_transaction_latlng": "51.2244, -12.12221",
      "debitor_approval_time": "",
      "debitor_device": "",
      "creditor": "StateOfCalifornia",
      "creditor_profile_latlng": "51.2244, -12.12221",
      "creditor_transaction_latlng": "51.2244, -12.12221",
      "creditor_approval_time": "",
      "creditor_device": "51.2244, -12.12221",
      "name": "8% California State Sales Tax",
      "price": "1.44",
      "quantity": "1.00",
      "unit_of_measurement": "characters",
      "units_measured": "29",
      "rule_instance_id": "",
      "transaction_id": "6789",
      "debit_approver": "John",
      "credit_approver": "Mary",
      "author": "Mary",
      "expiration_time": "2018-10-26T21:32:52",
      "rejection_time": "2018-10-26T21:32:52"
    }
  ]
}
```

# account balance computation
account balance = (SUM transaction WHERE account = creditor) - (SUM transaction WHERE account = debitor)
