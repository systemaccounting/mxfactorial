<p align="center">
  <a href="http://www.systemaccounting.org/math_identity" target="_blank"><img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png"></a>
</p>

* `bash build.sh deps|all`: creates .zip required for deployment. defaults to build only src files for lambda as `graphql-src.zip`. pass `deps` to build only dependency layer as `graphql-layer.zip`. pass `all` to build `src` and `deps`
* `bash deploy.sh dev|qa|prod`: in addition to building src (`bash build.sh "src"`), deploys to `dev`, `qa` or `prod` env. new layer versions NOT included in src deploy. new layer versions deployed through `terraform apply` only
* `bash test-all.sh dev|qa|prod`: runs tests locally. Need to add `.env` file containing `REACT_APP_COGNITO_POOL_ID` `REACT_APP_COGNITO_CLIENT_ID` variables into `/services/graphql-faas` directory before running 

## IMPORTANT
* **IF** `yarn add $PACKAGE` **THEN** `sh build.sh deps && terraform apply` to deploy new layer version 