<p align="center">
  <a href="http://www.systemaccounting.org/math_identity" target="_blank"><img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png"></a>
</p>

* `cd clone-faas` and `bash build.sh` before `terraform apply`. no `bash build.sh all` required for `clone-faas` deps. `bash deploy.sh $ENV` for `index.js` deployment
* `cd update-faas` and `bash build.sh all`, then `terraform apply`. `bash deploy.sh $ENV` for `index.js` deployment
*  new `update-faas` layer versions deployed through `terraform apply` only

## updating schema
*  push schema change commit to `schema/diffs`
*  `cd schema`
*  `bash schema.sh`
*  follow prompts


## important
* **IF** `yarn add $PACKAGE` in `update-faas` **THEN** `sh build.sh deps && terraform apply` to deploy new layer version 