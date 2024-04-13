<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

dev to prod docker image promotion

# service workflow files
1. test code: `cargo test` (todo: test in Dockerfile builder step)
2. build image: `make -C services/rule build-image`
3. tag image with git sha A: `make -C services/rule tag-dev-image`
4. push git sha A image to dev ecr repo: `make -C services/rule push-dev-image`

# dev-integration.yaml
5. merge to develop
6. test if currently deployed image in each dev function is last image in ecr repo: `tag-merge-commit.sh`
7. get git sha B from merge commit: `tag-merge-commit.sh`
8. tag each last undeployed image with git sha B: `tag-merge-commit.sh`
9. deploy each image with git sha B: `deploy-last-image.sh`
10. integration test in dev: `cargo test --manifest-path ./tests/Cargo.toml --features integration_tests -- --test-threads=1`
11. query dev ecr images for git sha B tags: `push-prod-image.sh`
12. tag dev git sha B images with prod: `push-prod-image.sh`
13. push git sha B images to prod: `push-prod-image.sh`

#### prod-services-deploy.yaml 
14. merge to master
15. test if currently deployed image in each prod function is last image in ecr repo: `tag-merge-commit.sh`
16. get git sha C from merge commit: `tag-merge-commit.sh`
17. tag each last undeployed image with git sha C: `tag-merge-commit.sh`
18. deploy each image with git sha C: `deploy-last-image.sh`