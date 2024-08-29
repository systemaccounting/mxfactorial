<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>


### graphql

structures and routes requests to systemaccounting services

\* postman does not support exporting subscription configuration from its graphql feature. until requests are ported to an alternative api testing client with an export feature, subscription testing is availble on http://localhost:10000/  

subscription query:
```gql
subscription QueryGdp($date: String!, $country: String, $region: String, $municipality: String) {
  queryGdp(date: $date, country: $country, region: $region, municipality: $municipality)
}
```
query variables:
```json
{
    "date": "2024-08-28",
    "country": "United States of America",
    "region": "California",
    "municipality": "Sacramento"
}
```

#### build & deploy FAST
* `make deploy ENV=dev` to build and deploy lambda

#### clean
1. `make clean`

terraform: https://github.com/systemaccounting/mxfactorial/blob/develop/infrastructure/terraform/aws/modules/environment/v001/graphql.tf