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

**q.** i dont find any words used by mass & social media here. what is this?  
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
  "debitor_approval_time": "2023-03-20T04:58:32.001Z"
}
```
not until transactions are typed as [conserved](https://en.wikipedia.org/wiki/Conserved_quantity) is applying encryption and replication relevant  

**q.** where will i bank?  
**a.** you dont need a bank. you need accounting. if you still wish to lend your money after receiving the service of accounting, please judge the risk of the loan you intend to offer the recipient by first exploiting your access to their accounting, then assume no one except you will own that risk after you consume it  

**q.** what is money?  
**a.** money is accounting. when someone has a 5 in their pocket, it's because they had a credit of 5 and someone else had a debit of 5  

**q.** what does physics have to do with accounting?  
**a.** recording transactions between users as debit-credit pairs enforces a conservation law on value. locking down the *'how to define and optimize the flow of goods and services?'* answer in a language that merges mathematical physics with computer science separates away the social from the science, and removes [high risk](https://en.wikipedia.org/wiki/Student_loan_default_in_the_United_States) academia from serving as a source of confusion, instability and justification for government failure. with macro**accounting** requiring economic resources to be described as *conserved*—and not just "scarce"—individuals stay clear of the many [schools of thought](https://en.wikipedia.org/wiki/Schools_of_economic_thought) indulged by the convenient handwaving of macroeconomics  

**q.** what is the equation?  
**a.** *u* = transactions per second, *w<sub>i</sub>* = value conserved per transaction, *Mx!* = value visible in a combinatorial game  

**q.** how to explain the equation to a non engineer?  
**a.** just say "add all the transactions conserving value every second":  

![sum conserved value now](https://github.com/user-attachments/assets/c6ea04b2-06a1-4234-b3d7-956007f5141f)  

**q.** how does standardizing financial value as a conserved quantity protect individuals?  
**a.** applying a conservation law to financial value protects producers and consumers from an abuse of government authority. consumer wealth increases when producers increase the [purchasing power](https://en.wikipedia.org/wiki/Information_content) of money by shipping useful r&d. but government printing money and government-chartered "bankers" expecting money are not the same types of events as producers shipping useful r&d. theyre not even the same types of events as producers shipping common goods and services since they unfairly depend on transferring their expense to everyone else. so when government authority is used to violate conservation by defining money as something you can just print and [mix](https://en.wikipedia.org/wiki/Money_multiplier) with failing "bank" notes, the loss of information in money from these physically negative events steals away the purchasing power created by producers, the wealth it creates for consumers and the measured value of all property  

government is not above failure, nor is it entitled to steal from the private sector to conceal its failure. improving government depends on failure [predicting](https://en.wikipedia.org/wiki/Time_travel_debugging) the individuals and laws that must be replaced. flying a flag and demanding loyalty before this step is just misdirection  

**q.** what is a bank?  
**a.** a lending business that receives government privilege in [12 U.S.C. § 1841(c)](https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title12-section1841&num=0&edition=prelim) to subsidize its cost of raising capital by anticompetitively [bundling](https://en.wikipedia.org/wiki/Product_bundling) the services of 1) storing and 2) moving money with 3) offering loans:

>(c) Bank Defined.-For purposes of this chapter-  
>&nbsp;&nbsp;&nbsp;(1) In general.-Except as provided in paragraph (2), the term "bank" means any of the following:  
>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(A) An insured bank as defined in section 3(h) of the Federal Deposit Insurance Act [12 U.S.C. 1813(h)].  
>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(B) An institution organized under the laws of the United States, any State of the United States, the District of Columbia, any territory of the United States, Puerto Rico, Guam, American Samoa, or the Virgin Islands which both-  
>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(i) accepts demand **<ins>deposits</ins>** or deposits that the depositor may withdraw by check or similar means for **<ins>payment</ins>** to third parties or others; and  
>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(ii) is engaged in the business of making commercial **<ins>loans</ins>**.  

**q.** how would a bank hypothetically operate in systemaccounting?  
**a.**
```json5
[
    // Starting with a zero balance, Jane receives 1000 from her employer
    {
        "item": "weekly salary",
        "price": 1000,
        "quantity": 1,
        "creditor": "Jane", // balance increases by 1000
        "debtitor": "Jane's Employer", // balance decreases by 1000
        "debitor_approval_time": "2021-01-01T12:00:00Z",
        "creditor_approval_time": "2021-01-01T12:05:00Z"
    },
    // Jane deposits 1000 in the bank and can withdraw it whenever she wants
    {
        "item": "bank deposit",
        "price": 1000,
        "quantity": 1,
        "creditor": "Bank Of America", // balance increases by 1000
        "debtitor": "Jane", // balance decreases by 1000
        "debitor_approval_time": "2021-01-01T12:10:00Z",
        "creditor_approval_time": "2021-01-01T12:11:00Z"
    },
    // but then Bank Of America decides to lend 1000 to John the Borrower
    {
        "item": "10% promissory note of 1000",
        "price": 1000,
        "quantity": 1,
        "creditor": "John the Borrower", // balance increases by 1000
        "debitor": "Bank Of America", // balance decreases by 1000
        "debitor_approval_time": "2021-01-01T12:15:00Z",
        "creditor_approval_time": "2021-01-01T12:16:00Z" 
    },
    // Jane can't withdraw 1000 until John the Borrower redeems the promissory note from Bank Of America
    {
        "item": "redeem 10% promissory note of 1000",
        "price": 1010,
        "quantity": 1,
        "creditor": "Bank Of America", // balance increases by 1010
        "debtitor": "John the Borrower", // balance decreases by 1010
        "debitor_approval_time": "2022-01-01T12:00:00Z",
        "creditor_approval_time": "2022-01-01T12:01:00Z"
    },
    // Now Jane can withdraw the 1000
    {
        "item": "bank withdrawal",
        "price": 1000,
        "quantity": 1,
        "creditor": "Jane", // balance increases by 1000
        "debtitor": "Bank Of America", // balance decreases by 1000
        "debitor_approval_time": "2022-01-01T12:10:00Z",
        "creditor_approval_time": "2022-01-01T12:11:00Z"
    }
]
```
**q.** operating a bank in systemaccounting is ridiculous. why would i use it to store and move money?  
**a.** you wouldn't. receiving government privilege to tell depositors their money is still in the vault after exchanging it for a promissory note only violates a [natural physical law](https://en.wikipedia.org/wiki/You_can%27t_have_your_cake_and_eat_it). money is accounting. using a payment app supplied by the u.s. treasury empowers you to store your money and pay others independently from banks  

**q.** where would i get a loan?  
**a.** talk to a lending business  

**q.** and how do lending businesses raise money?  
**a.** by publishing their performance. investors confidently supply capital to lending businesses when their accounting proves they can profitably buy and sell promissory notes. storing and moving money for the public is NOT relevant to finance and only a matter of security  

**q.** but what if i don't want to publish my earnings?  
**a.** publishing your earnings is not required but you won't attract capital. publishing profit signals to investors the demand for capital, or the supply of return, and invites competition from producers capable of lowering prices for consumers. indulging a fear of competition through secrecy weakens an economy and enables greed  

**q.** what would happen to central banks?  
**a.** enforcing a conservation law on value privatizes the balance sheets of banks. central banks are not necessary when banks cannot include their balance sheets in the money supply  

**q.** what would happen to the money multiplier?  
**a.** there's no such thing as the "money multiplier". this phrase is weasel wording for equating assets of different types. the private instrument used to measure value expected in the future is not equal to the public instrument used to measure value earned in the past: `bank note (risk > 0) != money (risk = 0)`. by defining value and liability as conserved, systemaccounting introduces a physics-based type system into finance that prevents such abuses  

**q.** shouldn't money always be earning interest?  
**a.** a free market does not require consuming financial risk  

**q.** how does systemaccounting manage expectation?  
**a.** central banks providing "forward guidance" appease the democratic mandate more than they set expectation when they print money and manipulate interest rates. in addition to enforcing a conservation law on value, systemaccounting prices capital by switching the "risk-free" rate from referencing the hackable price of debt to the immutably recorded price of equity. when the risk-free rate refers to the empirical rate, i.e. to the historical and not the expected, the economy remains protected from the catastrophic failure indulged by government mispricing  

removing financial appeasement guides the freedom of speech by recalibrating expectation to the empirical  

**q.** how are prices regulated in systemaccounting?  
**a.** prices are regulated naturally by dynamic equilibrium. when rates of return are empirical and transparent, capital can flow to above average rates to help increase supply and lower prices  

**q.** how does systemaccounting manage financial stability?  
**a.** systemaccounting automates financial stability by typing transactions as conserved. [bounding](https://en.wikipedia.org/wiki/BIBO_stability) financial system inputs automatically protects it from blowing up  

**q.** how does systemaccounting simplify money mechanics?  
**a.** by banishing the science fiction "monetary" economics adds to it. modeling the economy as a physical system is both practical and rational. a conservation of value creates a mirror between past and future: sell something to create a potential so you can kineticize it later. sticking with classical mechanics protects [public sanity](https://claude.ai/share/b3688c38-3af5-4908-891f-009404812d83)  

**q.** how does systemaccounting improve tax collection?  
**a.** measuring tax liability and its collection are automated by the [rule](https://github.com/systemaccounting/mxfactorial/tree/develop/services/rule) service in systemaccounting. for example, a store owner adds a 9% sales tax rule to their business account. someone shopping in their store brings a bottle of water priced at 1.000 to the cashier. the cashier sends 1 x 1.000 x bottled water to the rule service. the rule service responds with a 1 x 0.090 x sales tax in addition to the original 1 x 1.000 x bottled water. when the cashier and shopper approve the transaction, the shopper's balance decreases by 1.090, the store account increases by 1.000, and the state account increases by 0.090. systemaccounting simultaneously settles transactions across multiple accounts in a single transaction. no need for quarterly estimations, paper work or expensive accountants  

**q.** how are stock markets affected?  
**a.** "stocks" and "bonds" and their markets arent necessary in systemaccounting. debt and equity are traded without complicated abstractions through the rule service. if youre a business owner, just sell a rule to an investor promising a threshold-triggered dividend or a regularly scheduled debt service payment. systemaccounting also empowers you to publish the real time performance of your business account, so investors may very well find you first and offer to purchase those rules from you (investor confidence is strengthened by empirical data and you wont have to pay overly priced bankers, lawyers, accountants, regulators, etc for an "IPO")  

"secondary" markets are more resale speculation casinos than accessible sources of capital empowering production. money that doesnt bet on returns directly from physical production is *soft*  

**q.** what is black-scholes?  
**a.** a formula used to guess the value of uncertainty in a system that hides information. it prices the future when the present isn't measurable. black-scholes isn’t required in systemaccounting because risk is replaced by resolution. transaction frequency and conserved value flow provide a transparent measure of return—so value isn’t modeled, it’s seen  

**q.** what is capm?  
**a.** a model that estimates return by adding arbitrary noise to a fabricated baseline. capm is a workaround for an unobservable market. systemaccounting eliminates the need for capm by exposing the cost of capital empirically. when rates of return are measurable, pricing risk requires no betas, no portfolios, and no “expected returns”  

**q.** what is modigliani & miller?  
**a.** a theorem that proves a firm’s value doesn’t depend on whether it’s funded by debt or equity—as long as you don’t cheat. systemaccounting enforces that proof by removing the cheat codes. tax advantages, asymmetric information, and leverage schemes vanish when all transactions are conserved and value must be earned before it’s priced  

**q.** how does systemaccounting model an economy?  
**a.** systemaccounting recognizes the public's right to continuity when searching for correlation so it models economic activity with conformal geometric algebra. in a cga economy, goods and services are referenced in transactions as 3d objects. this 3d physical space of goods and services provides the data model's base space. then motion of goods services between debitors and creditors is modeled by orthogonally extending the base space with 2 more debitor and creditor dimensions. adding a quadratic structure to the debitor and creditor dimensions and assigning each to -1 and +1 respectively enables measuring the alternating, signed recurrence of accounts across transactions. now referencing industry, occupation and other contextual values across *transactions as rotations* supports designing financial and economic queries with continuity-embedding multivectors. propagating economic value through light-like transactions achieves a much higher form of fidelity to how information travels in spacetime than through the transactions middled by government-chartered "banks"  

**q.** how to explain *transactions as rotations* to a non engineer?  
**a.** just say "value rotates between debitor and creditor accounts":

<p align="center"><img width="600" alt="transactions as rotations" src="https://github.com/user-attachments/assets/1f4b165a-bfbf-462b-8baa-e00563524e0b"></p>

**q.** how do bivector transactions project value through time?  
**a.** like homogeneous coordinates: (debitor, creditor, price × quantity) or (debitor/(price × quantity), creditor/(price × quantity), 1)  

**q.** does replacing a banking with a cga economy require a democratic mandate?  
**a.** no. but while sending someone down a hole with a spartan kick to the chest is tempting when you hear them claim the choice to stop stealing from you through a "money multiplier" is their *democratic right*, they're likely still under the spell that the counted opinion has more authority than the empirical one  

so they'll receive **courtesy** while the instrument used to finance this absurdity is expediently removed  

**q.** will a government hosted payment app reduce my freedom?  
**a.** the government can already see your transactions. systemaccounting empowers you to see the transactions of your government. access to the realtime financial performance of your government helps protect you from electing individuals who exploit money printing, price manipulation and the absence of accountability to systematize the cost of their failures to everyone else  

**q.** will a government hosted payment app reduce my privacy?  
**a.** the economy as a crystal ball not only defends against the surveillance state by empowering a surveilling public, it eliminates a far more subtle but destructive hack enabled by the absence of evidence. the option to publish account performance is offered to protect 1) investors from businesses owners who do NOT want to signal the demand for capital with an **empirical** rate of return, and 2) voters from government officials who do NOT want to keep citizens informed of the performance of fiscal policies with **empirical** data  

so while you don't need to publish your account activity, earning capital or votes is less likely if trust in your leadership depends on accountability  

**q.** does this app require a fixed money supply?  
**a.** no. decimal precision can be increased  

**q.** doesn't decentralized finance offer the most security?  
**a.** centralized finance is not a threat when it's transparent. and decentralizing finance unwittingly decentralizes a cost center. information symmetry supplies the highest form of security and a single source rapidly receiving the most advanced r&d empowers the public with the most scalable reduction in the cost of storing, transforming and transmitting information  

**q.** why can't we just remove government entirely from money?  
**a.** removing law enforcement from money leaves it impotent  

**q.** but what if i still don't want the government to know about my transactions?  
**a.** then don't ask them to measure and testify you delivered value to someone else  

**q.** how does systemaccounting define a transaction in a free market?  
**a.** `value independently measured by seller - value independently measured by buyer = 0` in a space where the [order](https://en.wikipedia.org/wiki/Subtraction#Anti-commutativity) between production and consumption matters:  
```json5
[
  {
    "item": "bottled water",
    "price": "1.000", // 1.000 measured by seller - 1.000 measured by buyer = 0
    "quantity": "1",
    "creditor": "GroceryStore", // seller (producer)
    "debitor": "JacobWebb", // buyer (consumer)
    "creditor_approval_time": "2023-03-20T04:58:27.771Z", // time seller independently measured 1.000 price
    "debitor_approval_time": "2023-03-20T04:58:32.001Z" // time buyer independently measured 1.000 price
  }
]
```  

**q.** how does systemaccounting model a free market?  
**a.** by splitting **everything** between debitors and creditors [right down the middle](https://en.wikipedia.org/wiki/Spacetime_algebra#Spacetime_split) and standing guard with a conservation law. chasing out "monetary" policy with physics protects everyone from fiscal policy socializing its deficits into the center  

**q.** how does systemaccounting affect setting public policy?  
**a.** solving problems one at a time depends on 1) researching facts, 2) designing a solution, 3) applying the solution, 4) measuring its input and output and 5) holding contributors accountable. empowering sincere fact finders and problem solvers with more convenient access to public data science reduces the risk of luring them into the idle game of assigning blame between fictional social groups  

**q.** how does systemaccounting create jobs?  
**a.** the demand for labor increases when capital is allocated. for example, when an investor can quickly and confidently find a profitable grocery store chain and supply the owner capital to open more stores, the owner will hire more labor. systemaccounting accelerates the movement of capital by setting the measure of its demand to the conveniently discoverable and empirical supply of return  

on the other hand, systemaccounting will eliminate a lot of archaic labor dependent on market friction in the short term and manual labor dependent on highly repetitive work in the long term (automation attracts capital). [be patient](https://gist.github.com/mxfactorial/e127115f4e9d240dd992cfc0920d1527)  

**q.** do you have any demos?  
**a.** watch the [economic policy as code](https://mxfactorial.video/) video series  

**q.** how to explain this project to non engineers?  
**a.** invite them to speak with an [ai](https://youtu.be/ZealDFpricU)  

**q.** how to explain this project to a physicist?  
**a.** represent each account as a basis vector:

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $e_a$ = unit vector for account `a`    
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; $e_b$ = unit vector for account `b`  

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;then a transaction between `a` (debitor) and `b` (creditor) with scalar value $v$ is expressed as

$$T_{ab} = v \cdot (e_b \wedge e_a)$$

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;since the exterior product is antisymmetric

$$e_b \wedge e_a = -(e_a \wedge e_b)$$

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;the transaction is signed
* $+v$ for the creditor (inflow)
* $-v$ for the debitor (outflow)

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;to enforce conservation we define the full transaction operator as nilpotent

$$T_{ab} + T_{ba} = 0$$

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;so

$$v \cdot (e_b \wedge e_a) + v \cdot (e_a \wedge e_b) = 0$$

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;which holds since

$$e_b \wedge e_a = -e_a \wedge e_b$$

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;now each transaction is a zero-sum rotation between two dual accounts in value-time space

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;to project through time we extend each vector with a temporal coordinate

$$x_a = (e_a, t_a) \quad x_b = (e_b, t_b)$$

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;then define the temporal bivector

$$T_{ab} = v \cdot \left[(e_b, t_b) \wedge (e_a, t_a)\right]$$

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;this rotation spans a plane in spacetime with direction (credit → debit) and magnitude $v$

<p align="center"><img width="500" alt="nilpotent" src="lightcones.png"></p>

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;with the transaction json

```json
{ "price": "1.000", "quantity": "1", "creditor": "b", "debitor": "a" }
```

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;algebraically modeling

$$\text{value} = pq = 1.000 \quad T_{ab} = pq \cdot (e_b \wedge e_a)$$

—or you can just invite them to speak with an [ai](https://claude.ai/share/9ebc37e9-709d-4df3-a199-a5ec54543fda)  

**q.** what does mxfactorial mean?  
**a.** it measures the value flowing through grade-2 paths in a multivector-enabled combinatorial expansion  

buysiding for the public is a service and not a privilege. while "fed governors" of a banking economy sit around in closed meetings before telling the public what prices they should pay, systemaccountants of a cga state space roll up their sleaves and openly help [hunt down](https://en.wikipedia.org/wiki/Combinatorial_optimization) those prices instead (policies for manifolds, suits for algorithms)  

**q.** how does mxfactorial define the future?  
**a.** it encodes potential economic states in a structured multivector form with future transactions as paths between accounts:  

$$Mx!\ future = \sum_{i=1}^{n} \sum_{j=1, j \neq i}^{n} v_{ij} \cdot (e_j \wedge e_i)$$

where:
* $i$ and $j$ iterate through all accounts
* $v_{ij}$ represents the potential value of a transaction between accounts $i$ and $j$
* $e_j \wedge e_i$ is the bivector representing the oriented path from account $i$ to account $j$

the future is the number of transactions possible across all pairs of accounts benefiting from path independence and an optimization-enabled least action principle  

**q.** how does systemaccounting create a light-cone of the economy?  
**a.** systemaccounting defines a quadratic 5d geometric structure over real economic data by modeling each transaction as a nilpotent bivector. this enforces conservation and directionality, restricting economic evolution to physically legal paths. the result is a literal light-cone of constrained, measurable futures—not guessed, but geometrically derived  

**q.** what research does mxfactorial apply?  
**a.** the [geometric number](https://gist.github.com/mxfactorial/c151619d22ef6603a557dbf370864085), but with strings as angle preserving coordinates  

**q.** why is the code public if the license is private?  
**a.** publicly used code is a public structure

**q.** what price does systemaccounting charge to conserve value?  
**a.** the transaction author is charged `0.001` per transaction:
```json5
[ // 1.000 bottled water + 0.001 transaction cost = 1.001 total
  {
    "item": "bottled water",
    "price": "1.000",
    "quantity": "1",
    "creditor": "GroceryStore",
    "debitor": "JacobWebb",
    "creditor_approval_time": null,
    "debitor_approval_time": null
  },
  {
    "item": "mxfactorial",
    "price": "0.001",
    "quantity": "1",
    "creditor": "GroceryStore",
    "debitor": "mxfactorial",
    "creditor_approval_time": null,
    "debitor_approval_time": null
  }
]
```

**q.** how to learn more about the project?  
**a.** open github copilot and ask it questions  

**q.** is systemaccounting administered by conservatives?  
**a.** no. everyones pushed left by mathematizing the right  

privilege often stealthily depends on state support just as poverty visibly depends on welfare  

both are visible to the mathematical right  

**q.** how is systemaccounting different from other payment apps?  
**a.** storing and moving money are a horse and carriage abstraction for the accounting of the non movement and movement of value between owners  

dont even say "money"  

these are government services  

of course these are not non government services  

and the government that protects path independence betweeen accounts will supply them in such a way that they will never allow you to externalize your costs to others or allow others to externalize their costs to you  

free speech does not entitle anyone to equate their promises to other peoples work, or palm off *money-tary* for **conserved** value  

**q.** why not pitch this to investors?  
**a.** startups pitch. a conservation law summons  

**q.** can i invest?  
**a.** contribute what you like. the dividend for believing in science is protection from other people's fiction  

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
* expressing a [conservation law](https://en.wikipedia.org/wiki/Conservation_law) through a [data structure](https://github.com/systemaccounting/mxfactorial/blob/develop/mxfactorial.ipynb) disambiguates *delivered* value from *expected* value, and replaces [committees](https://www.federalreserve.gov/financial-stability.htm) with an automated financial stability criterion
* producing a [scientific measure](http://www.systemaccounting.org/how_does_systemaccounting_produce_a_scientific_measure_of_the_cost_of_capital) of the equilibrium price of capital signals the demand for capital with an empirical rate of return instead of a [government defined word](https://www.systemaccounting.org/what_is_a_bank), and removes the ability of a central authority to [manipulate](https://en.wikipedia.org/wiki/Federal_funds_rate) the price of credit
* `SELECT SUM(price*quantity) FROM transactions WHERE time = NOW()` maximizes & protects for individuals a scientific standard the publicly-measured quarterly or annual '[GDP](https://en.wikipedia.org/wiki/Gross_domestic_product)' violates
* where an industry is [chartered](http://www.occ.gov/topics/licensing/index-licensing.html), [protected](https://en.wikipedia.org/wiki/Bailout), and [primarily depended upon](https://www.opensecrets.org/industries) by a government requiring [election assistance](https://en.wikipedia.org/wiki/Collusion), conserving value & liability (information) separates the balance sheets of governments from individuals, and eliminates [socializing](https://en.wikipedia.org/wiki/Externality#Negative) the [default risk](https://en.wikipedia.org/wiki/Liability_(financial_accounting)) of any individual or firm
* establishing the conditions studied by [combinatorial game theory](https://en.wikipedia.org/wiki/Combinatorial_game_theory) through physics & data science ends public dependency on such resources as [credit ratings](https://en.wikipedia.org/wiki/Bond_credit_rating), [quarterly filings](https://en.wikipedia.org/wiki/Form_10-Q), the Consumer Price Index ([CPI](https://en.wikipedia.org/wiki/Consumer_price_index)), and the federal reserve economic data ([FRED](https://en.wikipedia.org/wiki/Federal_Reserve_Economic_Data)) platform
* *accounts as projective coordinates*: structuring transactions between debiting and crediting users [across time](https://en.wikipedia.org/wiki/Homogeneous_coordinates) as a [binary logarithmic event](https://en.wikipedia.org/wiki/Binary_logarithm#Information_theory) creates a [2^n dimensional space](https://en.wikipedia.org/wiki/Clifford_algebra#Basis_and_dimension) in a data model
* *data as multivectors*: financial value is a [bivector](https://en.wikipedia.org/wiki/Bivector)-valued function of buyers and sellers adding ownership-coordinates to a [3d space](https://en.wikipedia.org/wiki/Conformal_geometric_algebra) parameterized by "time". the [dual](https://en.wikipedia.org/wiki/Hodge_star_operator) positive and negative string values expressed by the anticommutativity of the `"creditor" ∧ "debitor" = - ("debitor" ∧ "creditor")` exterior product defines a [nilpotent](https://en.wikipedia.org/wiki/Nilpotent) algebraic structure that preserves continuity when propagating [zero-sum](https://en.wikipedia.org/wiki/Zero-sum_game) changes to account balances
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
* maintaining publicly-accessible static and streaming endpoints servicing third-party visualization and optimization **(output)**

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