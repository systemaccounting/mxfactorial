# mxfactorial
<p align="center">
  <a href="http://www.systemaccounting.org/math_identity" target="_blank"><img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png"></a>
</p>

[![builds](https://img.shields.io/badge/workflows-building-brightgreen.svg)](https://github.com/systemaccounting/mxfactorial/actions) [![env](https://img.shields.io/badge/ENV-PROD-brightgreen.svg)](https://mxfactorial.io/) [![contribute](https://img.shields.io/badge/contribute-paypal-brightgreen.svg)](https://systemaccounting.nationbuilder.com/financial_endorsement)

*systemaccounting optimizes the flow of capital by expiditing the discovery of economic oppotunity through physics and data science. dashboarding real-time business performance within an equally-accessible space spanned by a metric not only maximizes capital's throughput between investors and entrepreneurs, it also transparently benchmarks lending rates between borrowers and lenders. in addition to eliminating interest rate manipulation by central commitees, systemaccounting also solves monetary inflation and systemic default risk through its practice of cross-user, double-entry accounting. by recording transactions as conserved quantites, user equity remains separate and protected from the liability produced by government-chartered lending firms - [@mxfactorial](https://twitter.com/mxfactorial)*

public demonstration of the following use cases through a systemaccounting function:
* expressing mathematical concepts as [data structures](https://github.com/systemaccounting/mxfactorial/blob/develop/mxfactorial.ipynb)
* combinatorial game theory through conformal geometric algebra: financial value is a [bivector](https://en.wikipedia.org/wiki/Bivector)-valued function of buyers and sellers adding [ownership-coordinates](https://en.wikipedia.org/wiki/Pl%C3%BCcker_coordinates) to a space where the dimensions of "ownership" and "value" are parameterized by "time" (the [dual positive and negative](https://en.wikipedia.org/wiki/Hodge_dual#Four_dimensions) string values expressed by the anticommutativity of the `"creditor" ∧ "debitor" = - ("debitor" ∧ "creditor")` exterior product defines the [continuity point](https://en.wikipedia.org/wiki/Connected_space#Path_connectedness) a [time](https://en.wikipedia.org/wiki/Time-scale_calculus)-dependent projection depends on to propagate [zero-sum](https://en.wikipedia.org/wiki/Zero-sum_game) changes to account balances)
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
                  "time": "2019-07-12T12:11:31",             "time": "2019-07-14T07:36:15",
                }                                          }

// "Mary" account balance Δ = 0 after selling and buying in
// autonomous market pricing bread = milk
```  
* `SELECT SUM(item_value) FROM transactions WHERE debitor_approval_time IS NOT NULL AND creditor_approval_time IS NOT NULL AND transaction_completed_time='YYYY-MM-DD hh:mm:ss';` maximizes & protects for individuals a scientific standard the publicly-measured quarterly or annual '[GDP](https://en.wikipedia.org/wiki/Gross_domestic_product)' violates  
* separating the balance sheets of governments from individuals by disambiguating *delivered* value from *expected* value, and empirically recording ownership. enforcing a [law of conservation](https://en.wikipedia.org/wiki/Conservation_law) of value & liability (information) between owners eliminates the possibility of [socializing](https://en.wikipedia.org/wiki/Externality#Negative) the [default risk](https://en.wikipedia.org/wiki/Liability_(financial_accounting)) of any individual, firm, or industry (difficult to avoid when an industry is [chartered](http://www.occ.gov/topics/licensing/index-licensing.html), [protected](https://en.wikipedia.org/wiki/Bailout), and [primarily depended upon](http://www.opensecrets.org/industries./) by a government requiring [election assistance](https://en.wikipedia.org/wiki/Collusion))
* producing a [scientific measure](http://www.systemaccounting.org/how_does_systemaccounting_produce_a_scientific_measure_of_the_cost_of_capital) of the equilibrium price of capital removes the ability of a [central authority](https://en.wikipedia.org/wiki/Central_bank) to [manipulate](https://en.wikipedia.org/wiki/Federal_funds_rate) the price of credit
* establishing the conditions studied by [combinatorial game theory](https://en.wikipedia.org/wiki/Combinatorial_game_theory) through [physics & data science](http://www.systemaccounting.org/physics_of_value) ends public dependency on such resources as [credit ratings](https://en.wikipedia.org/wiki/Bond_credit_rating), [quarterly filings](https://en.wikipedia.org/wiki/Form_10-Q), the Consumer Price Index ([CPI](https://en.wikipedia.org/wiki/Consumer_price_index)), and the federal reserve economic data ([FRED](https://en.wikipedia.org/wiki/Federal_Reserve_Economic_Data)) platform
* enabling transaction automation through user-generated, open-source [Transaction Rule Scripts](https://github.com/systemaccounting/mxfactorial/issues/3) written in plain JavaScript **(input)**
* maintaining publicly-accessible static and streaming endpoints servicing third-party visualization and [optimization](https://en.wikipedia.org/wiki/Combinatorial_optimization) **(output)**

this project is intended to exploit the software engineering community's familiarity with data science to rapidly develop their capacity to describe an economy using mathemtical physics. software engineers may be expediently converted to phd-level experts because they come equipped with the technology to expediently test, adopt, and communicate the subject to others. adding to the project's **[list of features](https://github.com/systemaccounting/mxfactorial/issues?q=is%3Aissue+is%3Apublic+sort%3Acreated-asc)** is designed to foster enough interaction between engineers and the data model that a movement to eliminate nothing but [public ignorance](https://en.wikipedia.org/wiki/Pareto_efficiency) becomes generally accepted as possible *only* when it's precipitated by activism pursued—not in the streets where slogans, bottles, and rocks are blindly hurled at others who are equally frustrated with their economy, but on knowledge's frontier where science and technology are used as tools to empower mankind's movement in the cloud  

# contribute
* supporters preferring to contribute financial resources may do so from the [financial support](https://systemaccounting.nationbuilder.com/financial_endorsement) page. to contribute engineering resources, download & install [node.js](https://nodejs.org/en/download/)  
* if you're not familiar with node.js, or don't know how to code, begin the [freecodecamp.com](https://www.freecodecamp.com/) curriculum  

details as of 07/10/2020:
- client: [mxfactorial.io](https://mxfactorial.io/)
- api: [api.mxfactorial.io](https://api.mxfactorial.io/)
- [data model](https://docs.google.com/document/d/1US0gamuV3ExzUWAnNHxdcfmUxB0tPbtxUBVRBmZKywA/edit?usp=sharing)
- [wireframes](https://drive.google.com/folderview?id=0B9xlXsaN9dVQR1EyY3dQbnZ0aG8&usp=sharing)
- [public drive](https://drive.google.com/drive/folders/0B9xlXsaN9dVQWkJERUxNRVZQVWc)
- service inventory: `./makefile`
- access `./mxfactorial.ipynb` jupyter notebook locally:
    ```
    docker run --rm -p 8888:8888 -v $PWD:/home/jovyan/work jupyter/datascience-notebook
    ```

roadmap:
* set up managed application & persistence layer
* produce requirements & code for:
  * data model
  * endpoints
  * mobile web client for transactions (write)
  * mobile-enabled web client for visualizing economic activity (read) through the [data layer](https://developers.google.com/maps/documentation/javascript/datalayer) feature of the google maps javascript api  

**note**: both transaction and visualization clients will be strictly served by publicly-accessible endpoints to demonstrate for the u.s. treasury that with enough security, anyone may build an app that submits transaction data to the public ledger, thereby eliminating "banks" from the [value transmission](http://www.systemaccounting.org/what_is_money) equation
