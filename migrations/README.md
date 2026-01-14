<p align="center">
  <img width="475" alt="systemaccounting" src="https://user-images.githubusercontent.com/12200465/37568924-06f05d08-2a99-11e8-8891-60f373b33421.png">
</p>

### expedites
1. local development with [postgres in docker](https://hub.docker.com/r/bitnami/postgresql) and [go-migrate](https://github.com/golang-migrate/migrate)
1. rds migrations through go-migrate lambda with baked-in migration directories

### migration directories
1. `./schema`
1. `./seed` stores seed data common to dev and prod dbs
1. `./testseed` stores seed data for testing dbs only

prod db = `./schema` + `./seed`
test db = `./schema` + `./seed` + `./testseed`

### tl;dr start local development
1. `make run` to start postgres in docker
1. `make insert` to up migrate and insert a mix of approximately 40 requests and transactions

### work fast
1. add changes to migration directories
1. `make resetdocker` to drop and then up migrate all from `schema`, `seed` and `testseed` directories
1. `make testdocker` to up & down test `schema`, `seed` and `testseed` directories

### postgres docker commands
1. `make run` starts a local postgres docker container
1. `make stop` stops and removes postgres container
1. `make clean` stops container

### local development
1. complete tl;dr start local development section above
1. `make create NAME=rule DIR=schema` to create up and down rule sql files in `./schema`
1. add statements in new up and down rule sql files
1. `make resetdocker` to reset and apply all migrations

### compose task
reset local postgres with compose task:
```
docker compose -f docker/storage.yaml run --rm go-migrate --db_type test --cmd reset
```

### rds migrations
reset rds through go-migrate lambda:
```
bash scripts/go-migrate-rds.sh --env dev --cmd reset
```
possible `--cmd` values: `up`, `down`, `drop`, `reset`

### go-migrate lambda
1. `docker/go-migrate.Dockerfile` builds image with baked-in migration directories
1. `.github/workflows/go-migrate.yaml` builds and pushes image after `.github/workflows/migrations.yaml` passes
1. lambda invoked via function url with awscurl for IAM auth
