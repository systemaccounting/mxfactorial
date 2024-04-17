<p align="center"><a href="https://mxfactorial.video/" target="_blank"><img width="646" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/127420506-ca214ea5-a05b-43a3-b23d-36297ac2adca.png"></p>

[![contribute](https://img.shields.io/badge/contribute-paypal-brightgreen.svg)](https://www.paypal.com/paypalme/mxfactorial) [![Contribute with Gitpod](https://img.shields.io/badge/Contribute%20with-Gitpod-908a85?logo=gitpod)](https://gitpod.io/#https://github.com/systemaccounting/mxfactorial/tree/develop) [![Discord](https://img.shields.io/discord/868565277955203122.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/TCuRQPSQgF)

a payment application intended for deployment by the united states treasury that eliminates monetary inflation, systemic default risk and the uncompetitive access to capital  

systemaccounting optimizes the flow of capital by expediting the discovery of economic opportunity through physics and data science. dashboarding real-time business performance within an equally-accessible space spanned by a metric not only maximizes capital's throughput between investors and entrepreneurs, it also transparently benchmarks lending rates between borrowers and lenders. in addition to eliminating interest rate manipulation by central commitees, systemaccounting solves monetary inflation and systemic default risk through its practice of cross-user, double-entry accounting. by recording transactions as conserved quantites, user equity remains separate and protected from the liability produced by government-chartered lending firms

### content
[economic policy as code](https://mxfactorial.video/) video series  

### faqs
**q.** is this a "cryptocurrency"?  
**a.** no, and please use the word *encryption*  

**q.** is this a "blockchain"?  
**a.** no, and please use the word *replication*  

**q.** i dont find any words in here used by the media. what is this?  
**a.** encryption solves access risk. replication solves single point of failure and inconsistency risk. neither of these solutions are relevant to modeling currency as an electric current. this payment application solves contemporary economic issues by replacing "monetary" policy with a natural physical law

first, currency is modeled as a lightweight, dual positive-negative structured time-series between creditors and debitors respectively:
```json5
{
  "item": "bottled water",
  "price": "1.000",
  "quantity": "1",
  "creditor": "GroceryStore", // positive value (+)
  "debitor": "JacobWebb", // negative value (-)
  "creditor_approval_time": "2023-03-20T04:58:27.771Z",
  "debitor_approval_time": "2023-03-20T05:24:13.465Z"
}
```
encryption and replication are secondary

**q.** where will i bank?  
**a.** you dont need a bank. you need accounting. if you still wish to lend your money after receiving the service of accounting, please judge the risk of the loan you intend to offer the recipient by first exploiting your access to their accounting, then assume no one except you will own that risk after you consume it  

**q.** what is money?  
**a.** money is accounting. when someone has a 5 in their pocket, it's because they had a credit of 5 and someone else had a debit of 5  

**q.** what does physics have to do with accounting?  
**a.** recording transactions between users as debit-credit pairs enforces a conservation law on value. locking down the *'how to define and optimize the flow of goods and services?'* answer in a language that merges mathematical physics with computer science separates away the social from the science, and removes [high risk](https://en.wikipedia.org/wiki/Student_loan_default_in_the_United_States) academia from serving as a source of confusion, instability and justification for government failure. with macro**accounting** requiring economic resources to be described as *conserved*—and not just "scarce"—individuals stay clear of the many [schools of thought](https://en.wikipedia.org/wiki/Schools_of_economic_thought) indulged by the convenient handwaving of macroeconomics  

**q.** what is the equation?  
**a.** *u* = transactions per second, *w<sub>i</sub>* = value conserved per transaction, *Mx!* = value visible in a combinatorial game  

**q.** how does standardizing financial value as a conserved quantity protect individuals?  
**a.** applying a conservation law to financial value protects producers and consumers from an abuse of government authority. when producers increase the [purchasing power](https://en.wikipedia.org/wiki/Information_content) of money by shipping useful r&d, consumer wealth increases. but government printing money, and government chartered "bankers" expecting money are not the same types of events as producers shipping useful r&d. theyre not even the same types of events as producers shipping common goods and services. so when government authority is used to violate conservation by defining money as something you can just print and [mix](https://en.wikipedia.org/wiki/Money_multiplier) with failing "bank" notes, the loss of information in money from these physically negative events steals away the 1) purchasing power created by producers, the 2) increased wealth of consumers, and the 3) value of all property owned by individuals  

government is not above failure, nor is it entitled to steal from the private sector to conceal its failure. improving government depends on failure [predicting](https://en.wikipedia.org/wiki/Time_travel_debugging) the individuals and laws that must be replaced. flying a flag and demanding loyalty before this step is just misdirection  

**q.** how does systemaccounting manage expectation?  
**a.** central banks providing "forward guidance" appease more than they set expectation when they allow interest rate manipulation and money printing. systemaccounting prices capital by switching the "risk-free" rate from referencing the hackable price of debt to the immutably recorded price of equity. when the risk-free rate refers to the empirical rate, i.e. to the historical and not the expected, the economy remains protected from the catastrophic failure indulged by intended government mispricing  

removing financial appeasement guides the freedom of speech by recalibrating expectation to the empirical  

**q.** will a government hosted payment app reduce my freedom?  
**a.** the government can already see your transactions. systemaccounting empowers you to see the transactions of your government. access to the realtime financial performance of your government helps protect you from electing individuals who exploit money printing, price manipulation and the absence of accountability to systematize the cost of their failures to everyone else  

**q.** will a government hosted payment app reduce my privacy?  
**a.** you dont need to publish your account activity. publishing account data is a feature primarily intended for 1) businesses owners who wish to signal the demand for capital with an empirical rate of return and 2) government officials who wish to keep citizens informed of the performance of fiscal policies with empirical data  

**q.** do you have any demos?  
**a.** watch the [economic policy as code](https://mxfactorial.video/) video series  

**q.** how to explain this project to non engineers?  
**a.** share the [economic policy as code](https://mxfactorial.video/) video series  

**q.** why is the code public if the license is private?  
**a.** publicly used code is a public structure

**q.** can i invest?  
**a.** contribute what you like. the dividend for believing in science is protection

### how it works

1. the united states treasury acquires an [aba routing number](https://en.wikipedia.org/wiki/ABA_routing_transit_number) to a single account it will manage for the public independently from banks
1. the systemaccounting payment application is configured to perform subledger accounting *within* the united states treasury account by:
    1. creating, increasing and decreasing account balances from user transfers
    1. changing account balances between transacting users
    1. realtime reporting
1. new example accounts:
    1. a `GroceryStore` systemaccount is created when the owner transfers, for example, `1,000` from their "Bank of America" account to the united states treasury account
    1. a `JacobWebb` systemaccount is created when the owner transfers `1,000` from their "Chase" account to the united states treasury account
1. `JacobWebb` visits the `GroceryStore` and brings a single `bottled water` priced at `1.000` (3 digit decimals used) to the cashier
1. the `GroceryStore` cashier authors a single entry list of `transaction_items` to be transacted. the `GroceryStore` account is set as the **creditor** (+) and the `JacobWebb` account is set as as **debitor** (-):
    ```json5
    [
      { // authored by GroceryStore cashier
        "item": "bottled water",
        "price": "1.000",
        "quantity": "1",
        "creditor": "GroceryStore",
        "debitor": "JacobWebb",
        "creditor_approval_time": null,
        "debitor_approval_time": null
      }
    ]
    ```
1. the `GroceryStore` cashier first sends the `transaction_items` list to the `rule` service (see [detailed request & response](https://github.com/systemaccounting/mxfactorial/tree/develop/services/rule#request)) to check for any transaction automation rules that apply to the proposed transaction (taxes, approvals, etc) and receives a response with a creditor-approved state sales tax added to the `transaction_items` list:
    ```json5
    [
      {
        "item": "bottled water",
        "price": "1.000",
        "quantity": "1",
        "creditor": "GroceryStore",
        "debitor": "JacobWebb",
        "creditor_approval_time": null,
        "debitor_approval_time": null
      },
      { // transaction_item added by rule service
        "item": "9% state sales tax",
        "price": "0.090",
        "quantity": "1",
        "creditor": "StateOfCalifornia",
        "debitor": "JacobWebb",
        "creditor_approval_time": "2023-03-20T03:01:55.812Z", // approval added by rule service
        "debitor_approval_time": null
      }
    ]
    ```
1. the `GroceryStore` cashier then sends the rule-applied transaction request to the `request-create` service (see [detailed request & response](https://github.com/systemaccounting/mxfactorial/tree/develop/services/request-create#request)) to 1) create a transaction request and 2) add an approval for the `GroceryStore` creditor:
    ```json5
    [ // added to database by request-create service
      {
        "item": "bottled water",
        "price": "1.000",
        "quantity": "1",
        "creditor": "GroceryStore",
        "debitor": "JacobWebb",
        "creditor_approval_time": "2023-03-20T04:58:27.771Z", // added by request-create service
        "debitor_approval_time": null
      },
      {
        "item": "9% state sales tax",
        "price": "0.090",
        "quantity": "1",
        "creditor": "StateOfCalifornia",
        "debitor": "JacobWebb",
        "creditor_approval_time": "2023-03-20T03:01:55.812Z",
        "debitor_approval_time": null
      }
    ]
    ```
1. the `JacobWebb` customer receives a notification and sends their approval to the `request-approve` service (see [detailed request & response](https://github.com/systemaccounting/mxfactorial/tree/develop/services/request-approve#request))
    ```json5
    [
      {
        "item": "bottled water",
        "price": "1.000",
        "quantity": "1",
        "creditor": "GroceryStore",
        "debitor": "JacobWebb",
        "creditor_approval_time": "2023-03-20T04:58:27.771Z",
        "debitor_approval_time": "2023-03-20T05:24:13.465Z" // added by request-approve service
      },
      {
        "item": "9% state sales tax",
        "price": "0.090",
        "quantity": "1",
        "creditor": "StateOfCalifornia",
        "debitor": "JacobWebb",
        "creditor_approval_time": "2023-03-20T03:01:55.812Z",
        "debitor_approval_time": "2023-03-20T05:24:13.465Z" // added by request-approve service
      }
    ]
    ```
1. the single `1.000 bottled water + 0.090 sales tax = 1.090 total` transaction simultaneously:
    1. decreases the `JacobWebb` account by `1.090`
    1. increases the `GroceryStore` account by `1.000`
    1. increases the `StateOfCalifornia` account by `0.090`
1. all accounts **never** default from systemic risk or lose value from "monetary" inflation
1. the public has 24 hour access to realtime revenue and expense reporting from the `StateOfCalifornia` account
1. the `GroceryStore` owner may publish account performance anytime to [signal](https://en.wikipedia.org/wiki/Signalling_(economics)) the demand for capital to investors with an **empirical** rate of return, i.e. NOT *pro forma*
1. capital in the financial market is now priced empirically and protected from manipulation by governments and committees

### general use cases
public demonstration of the following use cases through a systemaccounting function:
* expressing a [conservation law](https://en.wikipedia.org/wiki/Conservation_law) through a [data structure](https://github.com/systemaccounting/mxfactorial/blob/develop/mxfactorial.ipynb) disambiguates *delivered* value from *expected* value, and replaces [committees](https://www.federalreserve.gov/financial-stability.htm) with an automated [financial stability criterion](https://en.wikipedia.org/wiki/BIBO_stability)
* producing a [scientific measure](http://www.systemaccounting.org/how_does_systemaccounting_produce_a_scientific_measure_of_the_cost_of_capital) of the equilibrium price of capital signals the demand for capital with an empirical rate of return instead of a [government defined word](https://www.systemaccounting.org/what_is_a_bank), and removes the ability of a central authority to [manipulate](https://en.wikipedia.org/wiki/Federal_funds_rate) the price of credit
* `SELECT SUM(price*quantity) FROM transactions WHERE time = NOW()` maximizes & protects for individuals a scientific standard the publicly-measured quarterly or annual '[GDP](https://en.wikipedia.org/wiki/Gross_domestic_product)' violates
* where an industry is [chartered](http://www.occ.gov/topics/licensing/index-licensing.html), [protected](https://en.wikipedia.org/wiki/Bailout), and [primarily depended upon](https://www.opensecrets.org/industries) by a government requiring [election assistance](https://en.wikipedia.org/wiki/Collusion), conserving value & liability (information) separates the balance sheets of governments from individuals, and eliminates [socializing](https://en.wikipedia.org/wiki/Externality#Negative) the [default risk](https://en.wikipedia.org/wiki/Liability_(financial_accounting)) of any individual or firm
* establishing the conditions studied by [combinatorial game theory](https://en.wikipedia.org/wiki/Combinatorial_game_theory) through physics & data science ends public dependency on such resources as [credit ratings](https://en.wikipedia.org/wiki/Bond_credit_rating), [quarterly filings](https://en.wikipedia.org/wiki/Form_10-Q), the Consumer Price Index ([CPI](https://en.wikipedia.org/wiki/Consumer_price_index)), and the federal reserve economic data ([FRED](https://en.wikipedia.org/wiki/Federal_Reserve_Economic_Data)) platform
* *accounts as projective coordinates*: structuring transactions between debiting and crediting users [across time](https://en.wikipedia.org/wiki/Homogeneous_coordinates) as a [binary logarithmic event](https://en.wikipedia.org/wiki/Binary_logarithm#Information_theory) creates a [2^n dimensional space](https://en.wikipedia.org/wiki/Clifford_algebra#Basis_and_dimension) in a data model
* *data as multivectors*: financial value is a [bivector](https://en.wikipedia.org/wiki/Bivector)-valued function of buyers and sellers adding ownership-coordinates to a [3d space](https://en.wikipedia.org/wiki/Conformal_geometric_algebra)  parameterized by "time". the [dual](https://en.wikipedia.org/wiki/Hodge_star_operator) positive and negative string values expressed by the anticommutativity of the `"creditor" ∧ "debitor" = - ("debitor" ∧ "creditor")` exterior product defines the [continuity point](https://en.wikipedia.org/wiki/Path_(topology)) a [time](https://en.wikipedia.org/wiki/Time-scale_calculus)-dependent projection depends on to propagate [zero-sum](https://en.wikipedia.org/wiki/Zero-sum_game) changes to account balances
```
                                                 ★
                                                 ∧
                                               /   \
                            dual +/− value @ t       dual +/− value @ t+n
                                            /         \
                {                                          {
                  "debitor": "John",                         "debitor": "Mary",
                  "creditor": "Mary",                        "creditor": "Isaac",
                  "item": "bread",                           "item": "milk",
                  "price": "3.25",                           "price": "3.25",
                  "quantity": "1",                           "quantity": "1",
                  "time": "2019-07-12T12:11:31",             "time": "2019-07-14T07:36:15",
                }                                          }

// "Mary" account balance Δ = 0 after selling and buying in
// autonomous market pricing bread = milk
```  
* *contracts as code*: enabling transaction automation through publicly-contributed scripts, e.g. automating tax, debt & equity sales, dividend, interest, wage and bill payments  **(input)**
* maintaining publicly-accessible static and streaming endpoints servicing third-party visualization and [optimization](https://en.wikipedia.org/wiki/Combinatorial_optimization) **(output)**

this project intends to exploit the software engineering community's familiarity with data science to rapidly develop their capacity to describe an economy using mathemtical physics. software engineers may be expediently converted to phd-level experts because they come equipped with the technology to test, adopt, and communicate the subject to others. adding to the project's **[list of features](https://github.com/systemaccounting/mxfactorial/issues?q=is%3Aissue+is%3Apublic+sort%3Acreated-asc)** is designed to foster enough interaction between engineers and the data model that a movement to eliminate nothing but [public ignorance](https://en.wikipedia.org/wiki/Pareto_efficiency) becomes generally accepted as possible *only* when it's precipitated by activism pursued—not in the streets where slogans, bottles, and rocks are blindly hurled at others who are equally frustrated with their economy, but on knowledge's frontier where science and technology are used as tools to empower mankinds revolution in the cloud

### environment
- client: [mxfactorial.io](https://mxfactorial.io/)
- api: [api.mxfactorial.io](https://api.mxfactorial.io/)

### license
private, receiving added value is sustained & acknowledged by sending value

### contribute

**funds**: send from the [financial support](https://systemaccounting.nationbuilder.com/financial_endorsement) page

**code**: create an issue with a "developer license request" title, negotiate rate, fork, then send pull requests

### architecture

```
client (typescript, svelte, cloudfront/s3: demo web client targeting graphql)
  └── graphql (rust, api gateway/lambda: public interface for below services)
      ├── balance-by-account (rust, lambda: returns account balances)
      │   └── postgres
      ├── request-approve (rust, lambda: approves a transaction request)
      │   └── postgres
      ├── request-by-id (rust, lambda: returns a transaction request by id)
      │   └── postgres
      ├── request-create (rust, lambda: creates a transaction request between a buyer and seller)
      │   └── postgres
      ├── requests-by-account (rust, lambda: returns transaction requests by account)
      │   └── postgres
      ├── rule (rust, lambda: returns transactions with user defined rules applied, e.g. taxes, dividends, etc.)
      │   └── postgres
      ├── transaction-by-id (rust, lambda: returns a transaction by id)
      │   └── postgres
      └── transactions-by-account (rust, lambda: returns transactions by account)
          └── postgres
```

### development

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/systemaccounting/mxfactorial/tree/develop)
```
> make bootcamp
```

### notebook
access `./mxfactorial.ipynb` jupyter notebook locally:
  ```
  docker run \
    --rm \
    -p 8888:8888 \
    -v $PWD/mxfactorial.ipynb:/home/jovyan/mxfactorial.ipynb \
    jupyter/datascience-notebook
  ```

### requirements
- [wireframes](https://drive.google.com/folderview?id=0B9xlXsaN9dVQR1EyY3dQbnZ0aG8&usp=sharing)
- [public drive](https://drive.google.com/drive/folders/0B9xlXsaN9dVQWkJERUxNRVZQVWc)
- [data model](https://docs.google.com/document/d/1US0gamuV3ExzUWAnNHxdcfmUxB0tPbtxUBVRBmZKywA/edit?usp=sharing)

### roadmap
* set up managed application & persistence layer
* produce requirements & code for:
  * data model
  * endpoints
  * mobile web client for transactions (write)
  * mobile-enabled web client for visualizing economic activity (read) through the [data layer](https://developers.google.com/maps/documentation/javascript/datalayer) feature of the google maps javascript api  

**note**: both transaction and visualization clients will be strictly served by publicly-accessible endpoints to demonstrate for the u.s. treasury that with enough security, anyone may build an app that submits transaction data to the public ledger, thereby eliminating "banks" from the [value transmission](http://www.systemaccounting.org/what_is_money) equation
