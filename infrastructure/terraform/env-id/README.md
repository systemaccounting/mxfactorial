<p align="center">
  <a href="https://www.systemaccounting.org/" target="_blank"><img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png"></a>
</p>

the `random_id.env_id` terrform resource identifies a local development environment with the cloud infrastructure it creates

##### use
1. `git clone https://github.com/systemaccounting/mxfactorial`
1. `cd mxfactorial`
1. `make env-id` to create and locally store an `random_id.env_id` in `infrastructure/terraform/env-id`
1. `make build-dev` to provision `${env-id}-dev` infrastructure and deploy application code to aws
1. `git checkout -b feature-branch`
1. OPTIONAL: create a gitpod by navigating to a [context url](https://www.gitpod.io/docs/introduction/learn-gitpod/context-url) in the browser, e.g. `https://gitpod.io/#https://github.com/systemaccounting/mxfactorial/tree/feature-branch`
1. develop and submit pull request
1. `make delete-dev` to tear down `${env-id}-dev` infrastructure