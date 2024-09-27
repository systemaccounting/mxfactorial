<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

1. invoked by cognito after account created
1. auto-confirms newly created account in cognito
1. adds cognito user in `account` table
1. adds fake entry in `account_profile` table to avoid profile input forms in ui
1. sets `California` in account_profile to trigger a transaction rule
1. adds [approveAnyCreditItem](https://github.com/systemaccounting/mxfactorial/blob/dd809b5e5a45324c129d29d48155335312f12433/services/rules/src/rules/approveAnyCreditItem.js) rule instance to new account
1. adds initial `1000.00` demo account balance

deploy: `make deploy ENV=dev`

terraform: https://github.com/systemaccounting/mxfactorial/blob/d45b5dcb214eddb531819d2206786fbdd5c9033a/infra/terraform/aws/modules/environment/v001/lambda-services.tf#L134-L144